import { create } from "xmlbuilder2";
import { DocumentType, PaymentMethodType } from "@/app/_prisma/browser";
import { DocumentWithChildren } from "../types/document";
import { calculateDocumentTotals, round, toFixed } from "./general";

// https://docs.peppol.eu/poacc/billing/3.0/codelist/UNCL1001-inv/
const UNCL1001 = {
  [DocumentType.INVOICE]: 380,
  [DocumentType.WAYBILL]: 380,
  [DocumentType.DEBIT_NOTE]: 383,
  [DocumentType.PREPAYMENT]: 386
};

// https://docs.peppol.eu/poacc/billing/3.0/codelist/UNCL4461/
const UNCL4461 = {
  [PaymentMethodType.BANK]: 30,
  [PaymentMethodType.CARD]: 48,
  [PaymentMethodType.CASH]: 10,
  [PaymentMethodType.ONLINE]: 68,
  [PaymentMethodType.OTHER]: "ZZZ"
};

// https://docs.peppol.eu/poacc/billing/3.0/codelist/UNECERec20/
const UNITS = {
  piece: "H87",
  kiligram: "KGM",
  gram: "GRM",
  litre: "LTR",
  millilitre: "MLT",
  metre: "MTR",
  kilometre: "KMT",
  square_metre: "MTK",
  cubic_metre: "MTQ"
};

export function generatePeppolXml(document: DocumentWithChildren) {
  const {
    baseTotal,
    discountTotal,
    netTotal,
    nonTaxableNetTotal,
    vats,
    vatTotal,
    lateFeeTotal,
    grossTotal
  } = calculateDocumentTotals(
    document.items,
    document.dueDate,
    document.lateFeeRate,
    document.fromDocuments
  );

  const object = {
    Invoice: {
      "@xmlns": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
      "@xmlns:cac":
        "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
      "@xmlns:cbc":
        "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
      "cbc:CustomizationID":
        "urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0",
      "cbc:ProfileID": "urn:fdc:peppol.eu:2017:poacc:billing:01:1.0",
      "cbc:ID": document.docNum,
      "cbc:IssueDate": document.docDate.toISOString().slice(0, 10),
      "cbc:DueDate": document.dueDate.toISOString().slice(0, 10),
      "cbc:InvoiceTypeCode": UNCL1001[document.type],
      "cbc:Note": document.note,
      // "cbc:TaxPointDate": "", // Not required
      "cbc:DocumentCurrencyCode": document.currency,
      // "cbc:TaxCurrencyCode": "", // Not required
      // "cbc:AccountingCost": "", // Not required
      // "cbc:BuyerReference": "", // Not required
      // "cac:InvoicePeriod": {}, // Not required
      "cac:OrderReference": {
        "cbc:ID": document.docNum
        // "cbc:SalesOrderID": "" // Not required
      },
      "cac:BillingReference": [], // Not required
      // "cac:DespatchDocumentReference": {}, // Not required
      // "cac:ReceiptDocumentReference": {}, // Not required
      // "cac:OriginatorDocumentReference": {}, // Not required
      // "cac:ContractDocumentReference": {}, // Not required
      "cac:AdditionalDocumentReference": [], // Not required
      // "cac:ProjectReference": {}, // Not required
      "cac:AccountingSupplierParty": {
        "cac:Party": {
          "cbc:EndpointID": {
            "@schemeID": "ZZZ",
            "#": document.supplier.regNum
          },
          "cac:PartyIdentification": [], // Not required
          // "cac:PartyName": {}, // Not required
          "cac:PostalAddress": {
            // "cbc:StreetName": "", // Not required
            // "cbc:AdditionalStreetName": "", // Not required
            // "cbc:CityName": "", // Not required
            // "cbc:PostalZone": "", // Not required
            // "cbc:CountrySubentity": "", // Not required
            "cac:AddressLine": { "cbc:Line": document.supplier.address },
            "cac:Country": {
              "cbc:IdentificationCode": document.supplier.country
            }
          },
          "cac:PartyTaxScheme": [
            document.supplier.vatNum
              ? {
                  "cbc:CompanyID": `${document.supplier.country}${document.supplier.vatNum}`,
                  "cac:TaxScheme": { "cbc:ID": "VAT" }
                }
              : void 0
          ],
          "cac:PartyLegalEntity": {
            "cbc:RegistrationName": document.supplier.name,
            "cbc:CompanyID": {
              "@schemeID": "ZZZ",
              "#": document.supplier.regNum
            }
          }
          // "cac:Contact": {}, // Not required
        }
      },
      "cac:AccountingCustomerParty": {
        "cac:Party": {
          "cbc:EndpointID": {
            "@schemeID": "ZZZ",
            "#": document.recipient.regNum
          },
          // "cac:PartyIdentification": {}, // Not required
          // "cac:PartyName": {}, // Not required
          "cac:PostalAddress": {
            // "cbc:StreetName": "", // Not required
            // "cbc:AdditionalStreetName": "", // Not required
            // "cbc:CityName": "", // Not required
            // "cbc:PostalZone": "", // Not required
            // "cbc:CountrySubentity": "", // Not required
            "cac:AddressLine": { "cbc:Line": document.recipient.address },
            "cac:Country": {
              "cbc:IdentificationCode": document.recipient.country
            }
          },
          ...(document.recipient.vatNum
            ? {
                "cac:PartyTaxScheme": {
                  "cbc:CompanyID": `${document.recipient.country}${document.recipient.vatNum}`,
                  "cac:TaxScheme": { "cbc:ID": "VAT" }
                }
              }
            : {}),
          "cac:PartyLegalEntity": {
            "cbc:RegistrationName": document.supplier.name,
            "cbc:CompanyID": {
              "@schemeID": "ZZZ",
              "#": document.supplier.regNum
            }
          }
          // "cac:Contact": {}, // Not required
        }
      },
      // "cac:PayeeParty": {}, // Not required
      // "cac:TaxRepresentativeParty": {}, // Not required
      // "cac:Delivery": {}, // Not required
      "cac:PaymentMeans": [
        document.supplier.paymentMethods.map((method) => ({
          "cbc:PaymentMeansCode": UNCL4461[method.type],
          "cbc:PaymentID": document.docNum,
          // "cac:CardAccount": {}, // Not required
          "cac:PayeeFinancialAccount": {
            "cbc:ID": method.accNum,
            "cbc:Name": method.name
            // "cac:FinancialInstitutionBranch": {} // Not required
          }
        }))
      ],
      // "cac:PaymentTerms": {}, // Not required, can have info on late fees
      ...(lateFeeTotal > 0
        ? {
            "cac:AllowanceCharge": {
              "cbc:ChargeIndicator": "true",
              // "cbc:AllowanceChargeReasonCode": "", // Not required
              "cbc:AllowanceChargeReason": "Late payment interest",
              // "cbc:MultiplierFactorNumeric": "", // Not required
              "cbc:Amount": {
                "@currencyID": document.currency,
                "#": round(lateFeeTotal, 2)
              },
              // "cbc:BaseAmount": "", // Not required
              "cac:TaxCategory": {
                "cbc:ID": "O",
                // "cbc:Percent": "", // Not required
                "cac:TaxScheme": { "cbc:ID": "VAT" }
              }
            }
          }
        : {}),
      "cac:TaxTotal": {
        "cbc:TaxAmount": {
          "@currencyID": document.currency,
          "#": toFixed(vatTotal, 2)
        },
        "cac:TaxSubtotal": [
          nonTaxableNetTotal > 0
            ? {
                "cbc:TaxableAmount": {
                  "@currencyID": document.currency,
                  "#": toFixed(nonTaxableNetTotal, 2)
                },
                "cbc:TaxAmount": {
                  "@currencyID": document.currency,
                  "#": toFixed(0, 2)
                },
                "cac:TaxCategory": {
                  "cbc:ID": "S", // TODO VAT codes, AE, E, G, O, K (if O, then only O)
                  // "cbc:Percent": "", // Not required
                  // "cbc:TaxExemptionReasonCode": "", // TODO use CEF VATEX code or cbc:TaxExemptionReason
                  // "cbc:TaxExemptionReason": "", // TODO
                  "cac:TaxScheme": { "cbc:ID": "VAT" }
                }
              }
            : void 0,
          ...[...vats].map(([vatRate, { taxableNetTotal, vatTotal }]) => ({
            "cbc:TaxableAmount": {
              "@currencyID": document.currency,
              "#": toFixed(taxableNetTotal, 2)
            },
            "cbc:TaxAmount": {
              "@currencyID": document.currency,
              "#": toFixed(vatTotal, 2)
            },
            "cac:TaxCategory": {
              "cbc:ID": vatRate === 0 ? "Z" : "S",
              "cbc:Percent": toFixed(vatRate * 100, 0),
              "cac:TaxScheme": { "cbc:ID": "VAT" }
            }
          }))
        ]
      },
      "cac:LegalMonetaryTotal": {
        "cbc:LineExtensionAmount": {
          "@currencyID": document.currency,
          "#": toFixed(document.netTotal, 2)
        },
        "cbc:TaxExclusiveAmount": {
          "@currencyID": document.currency,
          "#": toFixed(nonTaxableNetTotal, 2)
        },
        "cbc:TaxInclusiveAmount": {
          "@currencyID": document.currency,
          "#": toFixed(vatTotal, 2)
        },
        // "cbc:AllowanceTotalAmount" : "", // Not required
        ...(lateFeeTotal > 0
          ? {
              "cbc:ChargeTotalAmount": {
                "@currencyID": document.currency,
                "#": toFixed(lateFeeTotal, 2)
              }
            }
          : {}),
        // "cbc:PrepaidAmount" : "", // TODO
        // "cbc:PayableRoundingAmount": "", // Not required
        "cbc:PayableAmount": {
          "@currencyID": document.currency,
          "#": toFixed(document.grossTotal, 2)
        }
      },
      "cac:InvoiceLine": document.items.map((item) => ({
        "cbc:ID": item.id,
        // "cbc:Note": item.description,
        "cbc:InvoicedQuantity": {
          "@unitCode": "ZZ", // Too many options
          "#": item.quantity
        },
        "cbc:LineExtensionAmount": {
          "@currencyID": document.currency,
          "#": toFixed(item.netTotal, 2)
        },
        // "cbc:AccountingCost": "", // Not required
        // "cac:InvoicePeriod": "", // Not required
        // "cac:OrderLineReference", // Not required
        // "cac:DocumentReference": "", // Not required
        "cac:AllowanceCharge": [
          item.discountValue > 0
            ? {
                "cbc:ChargeIndicator": "false",
                "cbc:AllowanceChargeReasonCode": 95,
                // "cbc:AllowanceChargeReason": "", // Not required
                "cbc:MultiplierFactorNumeric": toFixed(
                  item.discountRate * 100,
                  0
                ),
                "cbc:Amount": {
                  "@currencyID": document.currency,
                  "#": toFixed(item.discountTotal, 2)
                }
                // "cbc:BaseAmount": "" // Not required
              }
            : void 0
        ],
        "cac:Item": {
          "cbc:Name": item.name,
          "cbc:Description": item.description,
          // "cac:BuyersItemIdentification": {}, // Not required
          "cac:SellersItemIdentification": { "cbc:ID": item.sku },
          // "cac:StandardItemIdentification": {}, // Not required
          // "cac:OriginCountry": {}, // Not required
          // "cac:CommodityClassification": [], // Not required
          "cac:ClassifiedTaxCategory": {
            "cbc:ID": "S", // TODO VAT codes, AE, E, G, O, K (if O, then only O)
            "cbc:Percent": toFixed((item.vatRate || 0) * 100, 0),
            "cac:TaxScheme": { "cbc:ID": "VAT" }
          }
          // "cac:AdditionalItemProperty": [] // Not required
        },
        "cac:Price": {
          "cbc:PriceAmount": {
            "@currencyID": document.currency,
            "#": toFixed(item.netPrice, 2)
          },
          "cbc:BaseQuantity": 1,
          ...(item.discountValue > 0
            ? {
                "cac:AllowanceCharge": {
                  "cbc:ChargeIndicator": "false",
                  "cbc:Amount": {
                    "@currencyID": document.currency,
                    "#": toFixed(item.discountValue, 2)
                  }
                  // "cbc:BaseAmount": "" // Not required
                }
              }
            : {})
        }
      }))
    }
  };

  const doc = create({ version: "1.0", encoding: "UTF-8" }, object);
  return doc.end({ prettyPrint: true });
}
