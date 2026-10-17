import csv
from collections import Counter
import json
import subprocess
import sys
import unittest
from decimal import Decimal
from pathlib import Path


PROJECT = Path(__file__).resolve().parents[1]
WORKSPACE = PROJECT.parent
SOURCE = WORKSPACE / "papelaria_limpa.csv"
RAW_SOURCE = WORKSPACE / "vendas_papelaria.csv"
OUTPUT = PROJECT / "site" / "dados" / "vendas.json"


class PipelineTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source_before = SOURCE.read_bytes()
        cls.raw_before = RAW_SOURCE.read_bytes()
        subprocess.run([sys.executable, str(PROJECT / "preparar_dados.py")], check=True, cwd=PROJECT)
        cls.data = json.loads(OUTPUT.read_text(encoding="utf-8"))
        with SOURCE.open(encoding="utf-8-sig", newline="") as source_file:
            cls.source_rows = list(csv.DictReader(source_file))

    def test_source_preserved_and_rows_transferred(self):
        self.assertEqual(SOURCE.read_bytes(), self.source_before)
        self.assertEqual(RAW_SOURCE.read_bytes(), self.raw_before)
        self.assertEqual(len(self.source_rows), 180)
        self.assertEqual(len(self.data["vendas"]), len(self.source_rows))

    def test_raw_duplicate_evidence_and_cleaning_rules(self):
        with RAW_SOURCE.open(encoding="utf-8-sig", newline="") as raw_file:
            raw_rows = list(csv.DictReader(raw_file))
        duplicates = sum(count - 1 for count in Counter(tuple(row.items()) for row in raw_rows).values())
        repeated_ids = {row["id_venda"] for row in raw_rows if sum(other["id_venda"] == row["id_venda"] for other in raw_rows) > 1}
        self.assertEqual(len(raw_rows), 182)
        self.assertEqual(duplicates, 2)
        self.assertEqual(repeated_ids, {"V0010", "V0020"})
        self.assertEqual(len(self.source_rows), len(raw_rows) - duplicates)
        self.assertTrue(all(row["cidade"] == row["cidade"].strip() for row in self.source_rows))
        self.assertEqual({row["categoria"] for row in self.source_rows}, {"Acessórios", "Livros", "Papelaria"})
        self.assertEqual(sum(row["forma_pagamento"] == "Não informado" for row in self.source_rows), 4)

    def test_schema_completeness_and_unique_transaction_ids(self):
        required = {"id_venda", "data", "cidade", "categoria", "produto", "quantidade", "preco_unitario", "forma_pagamento", "valor_venda"}
        ids = []
        for row in self.data["vendas"]:
            self.assertEqual(set(row), required)
            self.assertTrue(all(value is not None and value != "" for value in row.values()))
            self.assertIsInstance(row["quantidade"], int)
            self.assertIsInstance(row["preco_unitario"], (int, float))
            self.assertIsInstance(row["valor_venda"], (int, float))
            ids.append(row["id_venda"])
        self.assertEqual(len(ids), len(set(ids)))

    def test_amounts_and_known_aggregate_example(self):
        # Recalcula do arquivo CSV, sem chamar a lógica de agregação do construtor.
        amounts = [Decimal(row["quantidade"]) * Decimal(row["preco_unitario"]) for row in self.source_rows]
        self.assertEqual(sum(amounts), Decimal("20059"))
        by_category = {}
        for row, amount in zip(self.source_rows, amounts):
            by_category[row["categoria"]] = by_category.get(row["categoria"], Decimal("0")) + amount
            self.assertEqual(Decimal(row["valor_venda"]), amount)
        self.assertEqual(by_category, {"Livros": Decimal("7438"), "Acessórios": Decimal("10517"), "Papelaria": Decimal("2104")})

        # Exemplo conhecido independente: duas transações, três unidades no total.
        known_sales = [(2, Decimal("3.50")), (1, Decimal("2.25"))]
        known_amounts = [quantity * price for quantity, price in known_sales]
        self.assertEqual(sum(known_amounts), Decimal("9.25"))
        self.assertEqual(len(known_sales), 2)
        self.assertEqual(sum(quantity for quantity, _ in known_sales), 3)
        self.assertEqual(sum(known_amounts) / len(known_sales), Decimal("4.625"))

    def test_report_and_site_assets_exist(self):
        self.assertTrue((PROJECT / "analise.md").is_file())
        for asset in ("index.html", "app.js", "styles.css"):
            self.assertTrue((PROJECT / "site" / asset).is_file())


if __name__ == "__main__":
    unittest.main()
