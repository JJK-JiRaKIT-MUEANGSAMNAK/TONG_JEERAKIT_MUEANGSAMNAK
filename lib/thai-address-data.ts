export interface ThaiProvince {
  name: string
  districts: {
    name: string
    subDistricts: {
      name: string
      postalCode: string
    }[]
  }[]
}

export const THAI_ADDRESS_DATA: ThaiProvince[] = [
  {
    "name": "กรุงเทพมหานคร",
    "districts": [
      {
        "name": "พระนคร",
        "subDistricts": [
          {
            "name": "พระบรมมหาราชวัง",
            "postalCode": "10200"
          },
          {
            "name": "วังบูรพาภิรมย์",
            "postalCode": "10200"
          },
          {
            "name": "วัดราชบพิธ",
            "postalCode": "10200"
          },
          {
            "name": "สำราญราษฎร์",
            "postalCode": "10200"
          },
          {
            "name": "ศาลเจ้าพ่อเสือ",
            "postalCode": "10200"
          },
          {
            "name": "เสาชิงช้า",
            "postalCode": "10200"
          },
          {
            "name": "บวรนิเวศ",
            "postalCode": "10200"
          },
          {
            "name": "ตลาดยอด",
            "postalCode": "10200"
          },
          {
            "name": "ชนะสงคราม",
            "postalCode": "10200"
          },
          {
            "name": "บ้านพานถม",
            "postalCode": "10200"
          },
          {
            "name": "บางขุนพรหม",
            "postalCode": "10200"
          },
          {
            "name": "วัดสามพระยา",
            "postalCode": "10200"
          }
        ]
      },
      {
        "name": "ดุสิต",
        "subDistricts": [
          {
            "name": "ดุสิต",
            "postalCode": "10300"
          },
          {
            "name": "วชิรพยาบาล",
            "postalCode": "10300"
          },
          {
            "name": "สวนจิตรลดา",
            "postalCode": "10300"
          },
          {
            "name": "สี่แยกมหานาค",
            "postalCode": "10300"
          },
          {
            "name": "ถนนนครไชยศรี",
            "postalCode": "10300"
          }
        ]
      },
      {
        "name": "หนองจอก",
        "subDistricts": [
          {
            "name": "กระทุ่มราย",
            "postalCode": "10530"
          },
          {
            "name": "หนองจอก",
            "postalCode": "10530"
          },
          {
            "name": "คลองสิบ",
            "postalCode": "10530"
          },
          {
            "name": "คลองสิบสอง",
            "postalCode": "10530"
          },
          {
            "name": "โคกแฝด",
            "postalCode": "10530"
          },
          {
            "name": "คู้ฝั่งเหนือ",
            "postalCode": "10530"
          },
          {
            "name": "ลำผักชี",
            "postalCode": "10530"
          },
          {
            "name": "ลำต้อยติ่ง",
            "postalCode": "10530"
          }
        ]
      },
      {
        "name": "บางรัก",
        "subDistricts": [
          {
            "name": "มหาพฤฒาราม",
            "postalCode": "10500"
          },
          {
            "name": "สีลม",
            "postalCode": "10500"
          },
          {
            "name": "สุริยวงศ์",
            "postalCode": "10500"
          },
          {
            "name": "บางรัก",
            "postalCode": "10500"
          },
          {
            "name": "สี่พระยา",
            "postalCode": "10500"
          }
        ]
      },
      {
        "name": "บางเขน",
        "subDistricts": [
          {
            "name": "อนุสาวรีย์",
            "postalCode": "10220"
          },
          {
            "name": "ท่าแร้ง",
            "postalCode": "10220"
          }
        ]
      },
      {
        "name": "บางกะปิ",
        "subDistricts": [
          {
            "name": "คลองจั่น",
            "postalCode": "10240"
          },
          {
            "name": "หัวหมาก",
            "postalCode": "10240"
          }
        ]
      },
      {
        "name": "ปทุมวัน",
        "subDistricts": [
          {
            "name": "รองเมือง",
            "postalCode": "10330"
          },
          {
            "name": "วังใหม่",
            "postalCode": "10330"
          },
          {
            "name": "ปทุมวัน",
            "postalCode": "10330"
          },
          {
            "name": "ลุมพินี",
            "postalCode": "10330"
          }
        ]
      },
      {
        "name": "ป้อมปราบศัตรูพ่าย",
        "subDistricts": [
          {
            "name": "ป้อมปราบ",
            "postalCode": "10100"
          },
          {
            "name": "วัดเทพศิรินทร์",
            "postalCode": "10100"
          },
          {
            "name": "คลองมหานาค",
            "postalCode": "10100"
          },
          {
            "name": "บ้านบาตร",
            "postalCode": "10100"
          },
          {
            "name": "วัดโสมนัส",
            "postalCode": "10100"
          }
        ]
      },
      {
        "name": "พระโขนง",
        "subDistricts": [
          {
            "name": "บางจาก",
            "postalCode": "10260"
          }
        ]
      },
      {
        "name": "มีนบุรี",
        "subDistricts": [
          {
            "name": "มีนบุรี",
            "postalCode": "10510"
          },
          {
            "name": "แสนแสบ",
            "postalCode": "10510"
          }
        ]
      },
      {
        "name": "ลาดกระบัง",
        "subDistricts": [
          {
            "name": "ลาดกระบัง",
            "postalCode": "10520"
          },
          {
            "name": "คลองสองต้นนุ่น",
            "postalCode": "10520"
          },
          {
            "name": "คลองสามประเวศ",
            "postalCode": "10520"
          },
          {
            "name": "ลำปลาทิว",
            "postalCode": "10520"
          },
          {
            "name": "ทับยาว",
            "postalCode": "10520"
          },
          {
            "name": "ขุมทอง",
            "postalCode": "10520"
          }
        ]
      },
      {
        "name": "ยานนาวา",
        "subDistricts": [
          {
            "name": "ช่องนนทรี",
            "postalCode": "10120"
          },
          {
            "name": "บางโพงพาง",
            "postalCode": "10120"
          }
        ]
      },
      {
        "name": "สัมพันธวงศ์",
        "subDistricts": [
          {
            "name": "จักรวรรดิ",
            "postalCode": "10100"
          },
          {
            "name": "สัมพันธวงศ์",
            "postalCode": "10100"
          },
          {
            "name": "ตลาดน้อย",
            "postalCode": "10100"
          }
        ]
      },
      {
        "name": "พญาไท",
        "subDistricts": [
          {
            "name": "สามเสนใน",
            "postalCode": "10400"
          }
        ]
      },
      {
        "name": "ธนบุรี",
        "subDistricts": [
          {
            "name": "วัดกัลยาณ์",
            "postalCode": "10600"
          },
          {
            "name": "หิรัญรูจี",
            "postalCode": "10600"
          },
          {
            "name": "บางยี่เรือ",
            "postalCode": "10600"
          },
          {
            "name": "บุคคโล",
            "postalCode": "10600"
          },
          {
            "name": "ตลาดพลู",
            "postalCode": "10600"
          },
          {
            "name": "ดาวคะนอง",
            "postalCode": "10600"
          },
          {
            "name": "สำเหร่",
            "postalCode": "10600"
          }
        ]
      },
      {
        "name": "บางกอกใหญ่",
        "subDistricts": [
          {
            "name": "วัดอรุณ",
            "postalCode": "10600"
          },
          {
            "name": "วัดท่าพระ",
            "postalCode": "10600"
          }
        ]
      },
      {
        "name": "ห้วยขวาง",
        "subDistricts": [
          {
            "name": "ห้วยขวาง",
            "postalCode": "10310"
          },
          {
            "name": "บางกะปิ",
            "postalCode": "10310"
          },
          {
            "name": "สามเสนนอก",
            "postalCode": "10310"
          }
        ]
      },
      {
        "name": "คลองสาน",
        "subDistricts": [
          {
            "name": "สมเด็จเจ้าพระยา",
            "postalCode": "10600"
          },
          {
            "name": "คลองสาน",
            "postalCode": "10600"
          },
          {
            "name": "บางลำภูล่าง",
            "postalCode": "10600"
          },
          {
            "name": "คลองต้นไทร",
            "postalCode": "10600"
          }
        ]
      },
      {
        "name": "ตลิ่งชัน",
        "subDistricts": [
          {
            "name": "คลองชักพระ",
            "postalCode": "10170"
          },
          {
            "name": "ตลิ่งชัน",
            "postalCode": "10170"
          },
          {
            "name": "ฉิมพลี",
            "postalCode": "10170"
          },
          {
            "name": "บางพรม",
            "postalCode": "10170"
          },
          {
            "name": "บางระมาด",
            "postalCode": "10170"
          },
          {
            "name": "บางเชือกหนัง",
            "postalCode": "10170"
          }
        ]
      },
      {
        "name": "บางกอกน้อย",
        "subDistricts": [
          {
            "name": "ศิริราช",
            "postalCode": "10700"
          },
          {
            "name": "บ้านช่างหล่อ",
            "postalCode": "10700"
          },
          {
            "name": "บางขุนนนท์",
            "postalCode": "10700"
          },
          {
            "name": "บางขุนศรี",
            "postalCode": "10700"
          },
          {
            "name": "อรุณอมรินทร์",
            "postalCode": "10700"
          }
        ]
      },
      {
        "name": "บางขุนเทียน",
        "subDistricts": [
          {
            "name": "ท่าข้าม",
            "postalCode": "10150"
          },
          {
            "name": "แสมดำ",
            "postalCode": "10150"
          }
        ]
      },
      {
        "name": "ภาษีเจริญ",
        "subDistricts": [
          {
            "name": "บางหว้า",
            "postalCode": "10160"
          },
          {
            "name": "บางด้วน",
            "postalCode": "10160"
          },
          {
            "name": "บางแค",
            "postalCode": "10160"
          },
          {
            "name": "บางแคเหนือ",
            "postalCode": "10160"
          },
          {
            "name": "บางไผ่",
            "postalCode": "10160"
          },
          {
            "name": "บางจาก",
            "postalCode": "10160"
          },
          {
            "name": "บางแวก",
            "postalCode": "10160"
          },
          {
            "name": "คลองขวาง",
            "postalCode": "10160"
          },
          {
            "name": "ปากคลองภาษีเจริญ",
            "postalCode": "10160"
          },
          {
            "name": "คูหาสวรรค์",
            "postalCode": "10160"
          }
        ]
      },
      {
        "name": "หนองแขม",
        "subDistricts": [
          {
            "name": "หนองแขม",
            "postalCode": "10160"
          },
          {
            "name": "หนองค้างพลู",
            "postalCode": "10160"
          }
        ]
      },
      {
        "name": "ราษฎร์บูรณะ",
        "subDistricts": [
          {
            "name": "ราษฎร์บูรณะ",
            "postalCode": "10140"
          },
          {
            "name": "บางปะกอก",
            "postalCode": "10140"
          }
        ]
      },
      {
        "name": "บางพลัด",
        "subDistricts": [
          {
            "name": "บางพลัด",
            "postalCode": "10700"
          },
          {
            "name": "บางอ้อ",
            "postalCode": "10700"
          },
          {
            "name": "บางบำหรุ",
            "postalCode": "10700"
          },
          {
            "name": "บางยี่ขัน",
            "postalCode": "10700"
          }
        ]
      },
      {
        "name": "ดินแดง",
        "subDistricts": [
          {
            "name": "ดินแดง",
            "postalCode": "10400"
          }
        ]
      },
      {
        "name": "บึงกุ่ม",
        "subDistricts": [
          {
            "name": "คลองกุ่ม",
            "postalCode": "10240"
          },
          {
            "name": "สะพานสูง",
            "postalCode": "10240"
          },
          {
            "name": "คันนายาว",
            "postalCode": "10240"
          }
        ]
      },
      {
        "name": "สาทร",
        "subDistricts": [
          {
            "name": "ทุ่งวัดดอน",
            "postalCode": "10120"
          },
          {
            "name": "ยานนาวา",
            "postalCode": "10120"
          },
          {
            "name": "ทุ่งมหาเมฆ",
            "postalCode": "10120"
          }
        ]
      },
      {
        "name": "บางซื่อ",
        "subDistricts": [
          {
            "name": "บางซื่อ",
            "postalCode": "10800"
          }
        ]
      },
      {
        "name": "จตุจักร",
        "subDistricts": [
          {
            "name": "ลาดยาว",
            "postalCode": "10900"
          },
          {
            "name": "เสนานิคม",
            "postalCode": "10900"
          },
          {
            "name": "จันทรเกษม",
            "postalCode": "10900"
          },
          {
            "name": "จอมพล",
            "postalCode": "10900"
          },
          {
            "name": "จตุจักร",
            "postalCode": "10900"
          }
        ]
      },
      {
        "name": "บางคอแหลม",
        "subDistricts": [
          {
            "name": "บางคอแหลม",
            "postalCode": "10120"
          },
          {
            "name": "วัดพระยาไกร",
            "postalCode": "10120"
          },
          {
            "name": "บางโคล่",
            "postalCode": "10120"
          }
        ]
      },
      {
        "name": "ประเวศ",
        "subDistricts": [
          {
            "name": "ประเวศ",
            "postalCode": "10250"
          },
          {
            "name": "หนองบอน",
            "postalCode": "10250"
          },
          {
            "name": "ดอกไม้",
            "postalCode": "10250"
          },
          {
            "name": "สวนหลวง",
            "postalCode": "10250"
          }
        ]
      },
      {
        "name": "คลองเตย",
        "subDistricts": [
          {
            "name": "คลองเตย",
            "postalCode": "10110"
          },
          {
            "name": "คลองตัน",
            "postalCode": "10110"
          },
          {
            "name": "พระโขนง",
            "postalCode": "10110"
          },
          {
            "name": "คลองเตยเหนือ",
            "postalCode": "10110"
          },
          {
            "name": "คลองตันเหนือ",
            "postalCode": "10110"
          },
          {
            "name": "พระโขนงเหนือ",
            "postalCode": "10110"
          }
        ]
      },
      {
        "name": "สวนหลวง",
        "subDistricts": [
          {
            "name": "สวนหลวง",
            "postalCode": "10250"
          }
        ]
      },
      {
        "name": "จอมทอง",
        "subDistricts": [
          {
            "name": "บางขุนเทียน",
            "postalCode": "10150"
          },
          {
            "name": "บางค้อ",
            "postalCode": "10150"
          },
          {
            "name": "บางมด",
            "postalCode": "10150"
          },
          {
            "name": "จอมทอง",
            "postalCode": "10150"
          }
        ]
      },
      {
        "name": "ดอนเมือง",
        "subDistricts": [
          {
            "name": "สีกัน",
            "postalCode": "10210"
          }
        ]
      },
      {
        "name": "ราชเทวี",
        "subDistricts": [
          {
            "name": "ทุ่งพญาไท",
            "postalCode": "10400"
          },
          {
            "name": "ถนนพญาไท",
            "postalCode": "10400"
          },
          {
            "name": "ถนนเพชรบุรี",
            "postalCode": "10400"
          },
          {
            "name": "มักกะสัน",
            "postalCode": "10400"
          }
        ]
      },
      {
        "name": "ลาดพร้าว",
        "subDistricts": [
          {
            "name": "ลาดพร้าว",
            "postalCode": "10230"
          },
          {
            "name": "จรเข้บัว",
            "postalCode": "10230"
          }
        ]
      },
      {
        "name": "วัฒนา",
        "subDistricts": [
          {
            "name": "คลองเตยเหนือ",
            "postalCode": "10110"
          },
          {
            "name": "คลองตันเหนือ",
            "postalCode": "10110"
          },
          {
            "name": "พระโขนงเหนือ",
            "postalCode": "10110"
          }
        ]
      },
      {
        "name": "บางแค",
        "subDistricts": [
          {
            "name": "บางแค",
            "postalCode": "10160"
          },
          {
            "name": "บางแคเหนือ",
            "postalCode": "10160"
          },
          {
            "name": "บางไผ่",
            "postalCode": "10160"
          },
          {
            "name": "หลักสอง",
            "postalCode": "10160"
          }
        ]
      },
      {
        "name": "หลักสี่",
        "subDistricts": [
          {
            "name": "ทุ่งสองห้อง",
            "postalCode": "10210"
          },
          {
            "name": "ตลาดบางเขน",
            "postalCode": "10210"
          }
        ]
      },
      {
        "name": "สายไหม",
        "subDistricts": [
          {
            "name": "สายไหม",
            "postalCode": "10220"
          },
          {
            "name": "ออเงิน",
            "postalCode": "10220"
          },
          {
            "name": "คลองถนน",
            "postalCode": "10220"
          }
        ]
      },
      {
        "name": "คันนายาว",
        "subDistricts": [
          {
            "name": "คันนายาว",
            "postalCode": "10230"
          }
        ]
      },
      {
        "name": "สะพานสูง",
        "subDistricts": [
          {
            "name": "สะพานสูง",
            "postalCode": "10240"
          }
        ]
      },
      {
        "name": "วังทองหลาง",
        "subDistricts": [
          {
            "name": "วังทองหลาง",
            "postalCode": "10310"
          }
        ]
      },
      {
        "name": "คลองสามวา",
        "subDistricts": [
          {
            "name": "สามวาตะวันตก",
            "postalCode": "10510"
          },
          {
            "name": "สามวาตะวันออก",
            "postalCode": "10510"
          },
          {
            "name": "บางชัน",
            "postalCode": "10510"
          },
          {
            "name": "ทรายกองดิน",
            "postalCode": "10510"
          },
          {
            "name": "ทรายกองดินใต้",
            "postalCode": "10510"
          }
        ]
      },
      {
        "name": "บางนา",
        "subDistricts": [
          {
            "name": "บางนา",
            "postalCode": "10260"
          }
        ]
      },
      {
        "name": "ทวีวัฒนา",
        "subDistricts": [
          {
            "name": "ทวีวัฒนา",
            "postalCode": "10170"
          },
          {
            "name": "ศาลาธรรมสพน์",
            "postalCode": "10170"
          }
        ]
      },
      {
        "name": "ทุ่งครุ",
        "subDistricts": [
          {
            "name": "บางมด",
            "postalCode": "10140"
          },
          {
            "name": "ทุ่งครุ",
            "postalCode": "10140"
          }
        ]
      },
      {
        "name": "บางบอน",
        "subDistricts": [
          {
            "name": "บางบอน",
            "postalCode": "10150"
          }
        ]
      }
    ]
  },
  {
    "name": "สมุทรปราการ",
    "districts": [
      {
        "name": "เมืองสมุทรปราการ",
        "subDistricts": [
          {
            "name": "ปากน้ำ",
            "postalCode": "10270"
          },
          {
            "name": "สำโรงเหนือ",
            "postalCode": "10270"
          },
          {
            "name": "บางเมือง",
            "postalCode": "10270"
          },
          {
            "name": "ท้ายบ้าน",
            "postalCode": "10280"
          },
          {
            "name": "บางปูใหม่",
            "postalCode": "10280"
          },
          {
            "name": "แพรกษา",
            "postalCode": "10280"
          },
          {
            "name": "บางโปรง",
            "postalCode": "10270"
          },
          {
            "name": "บางปู",
            "postalCode": "10270"
          },
          {
            "name": "บางด้วน",
            "postalCode": "10270"
          },
          {
            "name": "บางเมืองใหม่",
            "postalCode": "10270"
          },
          {
            "name": "เทพารักษ์",
            "postalCode": "10270"
          },
          {
            "name": "ท้ายบ้านใหม่",
            "postalCode": "10280"
          },
          {
            "name": "แพรกษาใหม่",
            "postalCode": "10280"
          }
        ]
      },
      {
        "name": "บางบ่อ",
        "subDistricts": [
          {
            "name": "บางบ่อ",
            "postalCode": "10560"
          },
          {
            "name": "บ้านระกาศ",
            "postalCode": "10560"
          },
          {
            "name": "บางพลีน้อย",
            "postalCode": "10560"
          },
          {
            "name": "บางเพรียง",
            "postalCode": "10560"
          },
          {
            "name": "คลองด่าน",
            "postalCode": "10550"
          },
          {
            "name": "คลองสวน",
            "postalCode": "10560"
          },
          {
            "name": "เปร็ง",
            "postalCode": "10560"
          },
          {
            "name": "คลองนิยมยาตรา",
            "postalCode": "10560"
          }
        ]
      },
      {
        "name": "บางพลี",
        "subDistricts": [
          {
            "name": "บางพลีใหญ่",
            "postalCode": "10540"
          },
          {
            "name": "บางแก้ว",
            "postalCode": "10540"
          },
          {
            "name": "บางปลา",
            "postalCode": "10540"
          },
          {
            "name": "บางโฉลง",
            "postalCode": "10540"
          },
          {
            "name": "ราชาเทวะ",
            "postalCode": "10540"
          },
          {
            "name": "หนองปรือ",
            "postalCode": "10540"
          }
        ]
      },
      {
        "name": "พระประแดง",
        "subDistricts": [
          {
            "name": "ตลาด",
            "postalCode": "10130"
          },
          {
            "name": "บางพึ่ง",
            "postalCode": "10130"
          },
          {
            "name": "บางจาก",
            "postalCode": "10130"
          },
          {
            "name": "บางครุ",
            "postalCode": "10130"
          },
          {
            "name": "บางหญ้าแพรก",
            "postalCode": "10130"
          },
          {
            "name": "บางหัวเสือ",
            "postalCode": "10130"
          },
          {
            "name": "สำโรงใต้",
            "postalCode": "10130"
          },
          {
            "name": "บางยอ",
            "postalCode": "10130"
          },
          {
            "name": "บางกะเจ้า",
            "postalCode": "10130"
          },
          {
            "name": "บางน้ำผึ้ง",
            "postalCode": "10130"
          },
          {
            "name": "บางกระสอบ",
            "postalCode": "10130"
          },
          {
            "name": "บางกอบัว",
            "postalCode": "10130"
          },
          {
            "name": "ทรงคนอง",
            "postalCode": "10130"
          },
          {
            "name": "สำโรง",
            "postalCode": "10130"
          },
          {
            "name": "สำโรงกลาง",
            "postalCode": "10130"
          }
        ]
      },
      {
        "name": "พระสมุทรเจดีย์",
        "subDistricts": [
          {
            "name": "นาเกลือ",
            "postalCode": "10290"
          },
          {
            "name": "บ้านคลองสวน",
            "postalCode": "10290"
          },
          {
            "name": "แหลมฟ้าผ่า",
            "postalCode": "10290"
          },
          {
            "name": "ปากคลองบางปลากด",
            "postalCode": "10290"
          },
          {
            "name": "ในคลองบางปลากด",
            "postalCode": "10290"
          }
        ]
      },
      {
        "name": "บางเสาธง",
        "subDistricts": [
          {
            "name": "บางเสาธง",
            "postalCode": "10540"
          },
          {
            "name": "ศีรษะจรเข้น้อย",
            "postalCode": "10540"
          },
          {
            "name": "ศีรษะจรเข้ใหญ่",
            "postalCode": "10540"
          }
        ]
      }
    ]
  },
  {
    "name": "นนทบุรี",
    "districts": [
      {
        "name": "เมืองนนทบุรี",
        "subDistricts": [
          {
            "name": "สวนใหญ่",
            "postalCode": "11000"
          },
          {
            "name": "ตลาดขวัญ",
            "postalCode": "11000"
          },
          {
            "name": "บางเขน",
            "postalCode": "11000"
          },
          {
            "name": "บางกระสอ",
            "postalCode": "11000"
          },
          {
            "name": "ท่าทราย",
            "postalCode": "11000"
          },
          {
            "name": "บางไผ่",
            "postalCode": "11000"
          },
          {
            "name": "บางศรีเมือง",
            "postalCode": "11000"
          },
          {
            "name": "บางกร่าง",
            "postalCode": "11000"
          },
          {
            "name": "ไทรม้า",
            "postalCode": "11000"
          },
          {
            "name": "บางรักน้อย",
            "postalCode": "11000"
          }
        ]
      },
      {
        "name": "บางกรวย",
        "subDistricts": [
          {
            "name": "วัดชลอ",
            "postalCode": "11130"
          },
          {
            "name": "บางกรวย",
            "postalCode": "11130"
          },
          {
            "name": "บางสีทอง",
            "postalCode": "11130"
          },
          {
            "name": "บางขนุน",
            "postalCode": "11130"
          },
          {
            "name": "บางขุนกอง",
            "postalCode": "11130"
          },
          {
            "name": "บางคูเวียง",
            "postalCode": "11130"
          },
          {
            "name": "มหาสวัสดิ์",
            "postalCode": "11130"
          },
          {
            "name": "ปลายบาง",
            "postalCode": "11130"
          },
          {
            "name": "ศาลากลาง",
            "postalCode": "11130"
          }
        ]
      },
      {
        "name": "บางใหญ่",
        "subDistricts": [
          {
            "name": "บางม่วง",
            "postalCode": "11140"
          },
          {
            "name": "บางแม่นาง",
            "postalCode": "11140"
          },
          {
            "name": "บางเลน",
            "postalCode": "11140"
          },
          {
            "name": "เสาธงหิน",
            "postalCode": "11140"
          },
          {
            "name": "บางใหญ่",
            "postalCode": "11140"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "11140"
          }
        ]
      },
      {
        "name": "บางบัวทอง",
        "subDistricts": [
          {
            "name": "โสนลอย",
            "postalCode": "11110"
          },
          {
            "name": "บางบัวทอง",
            "postalCode": "11110"
          },
          {
            "name": "บางรักใหญ่",
            "postalCode": "11110"
          },
          {
            "name": "บางคูรัด",
            "postalCode": "11110"
          },
          {
            "name": "ละหาร",
            "postalCode": "11110"
          },
          {
            "name": "ลำโพ",
            "postalCode": "11110"
          },
          {
            "name": "พิมลราช",
            "postalCode": "11110"
          },
          {
            "name": "บางรักพัฒนา",
            "postalCode": "11110"
          }
        ]
      },
      {
        "name": "ไทรน้อย",
        "subDistricts": [
          {
            "name": "ไทรน้อย",
            "postalCode": "11150"
          },
          {
            "name": "ราษฎร์นิยม",
            "postalCode": "11150"
          },
          {
            "name": "หนองเพรางาย",
            "postalCode": "11150"
          },
          {
            "name": "ไทรใหญ่",
            "postalCode": "11150"
          },
          {
            "name": "ขุนศรี",
            "postalCode": "11150"
          },
          {
            "name": "คลองขวาง",
            "postalCode": "11150"
          },
          {
            "name": "ทวีวัฒนา",
            "postalCode": "11150"
          }
        ]
      },
      {
        "name": "ปากเกร็ด",
        "subDistricts": [
          {
            "name": "ปากเกร็ด",
            "postalCode": "11120"
          },
          {
            "name": "บางตลาด",
            "postalCode": "11120"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "11120"
          },
          {
            "name": "บางพูด",
            "postalCode": "11120"
          },
          {
            "name": "บางตะไนย์",
            "postalCode": "11120"
          },
          {
            "name": "คลองพระอุดม",
            "postalCode": "11120"
          },
          {
            "name": "ท่าอิฐ",
            "postalCode": "11120"
          },
          {
            "name": "เกาะเกร็ด",
            "postalCode": "11120"
          },
          {
            "name": "อ้อมเกร็ด",
            "postalCode": "11120"
          },
          {
            "name": "คลองข่อย",
            "postalCode": "11120"
          },
          {
            "name": "บางพลับ",
            "postalCode": "11120"
          },
          {
            "name": "คลองเกลือ",
            "postalCode": "11120"
          }
        ]
      }
    ]
  },
  {
    "name": "ปทุมธานี",
    "districts": [
      {
        "name": "เมืองปทุมธานี",
        "subDistricts": [
          {
            "name": "บางปรอก",
            "postalCode": "12000"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "12000"
          },
          {
            "name": "บ้านกลาง",
            "postalCode": "12000"
          },
          {
            "name": "บ้านฉาง",
            "postalCode": "12000"
          },
          {
            "name": "บ้านกระแชง",
            "postalCode": "12000"
          },
          {
            "name": "บางขะแยง",
            "postalCode": "12000"
          },
          {
            "name": "บางคูวัด",
            "postalCode": "12000"
          },
          {
            "name": "บางหลวง",
            "postalCode": "12000"
          },
          {
            "name": "บางเดื่อ",
            "postalCode": "12000"
          },
          {
            "name": "บางพูด",
            "postalCode": "12000"
          },
          {
            "name": "บางพูน",
            "postalCode": "12000"
          },
          {
            "name": "บางกะดี",
            "postalCode": "12000"
          },
          {
            "name": "สวนพริกไทย",
            "postalCode": "12000"
          },
          {
            "name": "หลักหก",
            "postalCode": "12000"
          }
        ]
      },
      {
        "name": "คลองหลวง",
        "subDistricts": [
          {
            "name": "คลองหนึ่ง",
            "postalCode": "12120"
          },
          {
            "name": "คลองสอง",
            "postalCode": "12120"
          },
          {
            "name": "คลองสาม",
            "postalCode": "12120"
          },
          {
            "name": "คลองสี่",
            "postalCode": "12120"
          },
          {
            "name": "คลองห้า",
            "postalCode": "12120"
          },
          {
            "name": "คลองหก",
            "postalCode": "12120"
          },
          {
            "name": "คลองเจ็ด",
            "postalCode": "12120"
          }
        ]
      },
      {
        "name": "ธัญบุรี",
        "subDistricts": [
          {
            "name": "ประชาธิปัตย์",
            "postalCode": "12130"
          },
          {
            "name": "บึงยี่โถ",
            "postalCode": "12130"
          },
          {
            "name": "รังสิต",
            "postalCode": "12110"
          },
          {
            "name": "ลำผักกูด",
            "postalCode": "12110"
          },
          {
            "name": "บึงสนั่น",
            "postalCode": "12110"
          },
          {
            "name": "บึงน้ำรักษ์",
            "postalCode": "12110"
          }
        ]
      },
      {
        "name": "หนองเสือ",
        "subDistricts": [
          {
            "name": "บึงบา",
            "postalCode": "12170"
          },
          {
            "name": "บึงบอน",
            "postalCode": "12170"
          },
          {
            "name": "บึงกาสาม",
            "postalCode": "12170"
          },
          {
            "name": "บึงชำอ้อ",
            "postalCode": "12170"
          },
          {
            "name": "หนองสามวัง",
            "postalCode": "12170"
          },
          {
            "name": "ศาลาครุ",
            "postalCode": "12170"
          },
          {
            "name": "นพรัตน์",
            "postalCode": "12170"
          }
        ]
      },
      {
        "name": "ลาดหลุมแก้ว",
        "subDistricts": [
          {
            "name": "ระแหง",
            "postalCode": "12140"
          },
          {
            "name": "ลาดหลุมแก้ว",
            "postalCode": "12140"
          },
          {
            "name": "คูบางหลวง",
            "postalCode": "12140"
          },
          {
            "name": "คูขวาง",
            "postalCode": "12140"
          },
          {
            "name": "คลองพระอุดม",
            "postalCode": "12140"
          },
          {
            "name": "บ่อเงิน",
            "postalCode": "12140"
          },
          {
            "name": "หน้าไม้",
            "postalCode": "12140"
          }
        ]
      },
      {
        "name": "ลำลูกกา",
        "subDistricts": [
          {
            "name": "คูคต",
            "postalCode": "12130"
          },
          {
            "name": "ลาดสวาย",
            "postalCode": "12150"
          },
          {
            "name": "บึงคำพร้อย",
            "postalCode": "12150"
          },
          {
            "name": "ลำลูกกา",
            "postalCode": "12150"
          },
          {
            "name": "บึงทองหลาง",
            "postalCode": "12150"
          },
          {
            "name": "ลำไทร",
            "postalCode": "12150"
          },
          {
            "name": "บึงคอไห",
            "postalCode": "12150"
          },
          {
            "name": "พืชอุดม",
            "postalCode": "12150"
          }
        ]
      },
      {
        "name": "สามโคก",
        "subDistricts": [
          {
            "name": "บางเตย",
            "postalCode": "12160"
          },
          {
            "name": "คลองควาย",
            "postalCode": "12160"
          },
          {
            "name": "สามโคก",
            "postalCode": "12160"
          },
          {
            "name": "กระแชง",
            "postalCode": "12160"
          },
          {
            "name": "บางโพธิ์เหนือ",
            "postalCode": "12160"
          },
          {
            "name": "เชียงรากใหญ่",
            "postalCode": "12160"
          },
          {
            "name": "บ้านปทุม",
            "postalCode": "12160"
          },
          {
            "name": "บ้านงิ้ว",
            "postalCode": "12160"
          },
          {
            "name": "เชียงรากน้อย",
            "postalCode": "12160"
          },
          {
            "name": "บางกระบือ",
            "postalCode": "12160"
          },
          {
            "name": "ท้ายเกาะ",
            "postalCode": "12160"
          }
        ]
      }
    ]
  },
  {
    "name": "พระนครศรีอยุธยา",
    "districts": [
      {
        "name": "พระนครศรีอยุธยา",
        "subDistricts": [
          {
            "name": "ประตูชัย",
            "postalCode": "13000"
          },
          {
            "name": "กะมัง",
            "postalCode": "13000"
          },
          {
            "name": "หอรัตนไชย",
            "postalCode": "13000"
          },
          {
            "name": "หัวรอ",
            "postalCode": "13000"
          },
          {
            "name": "ท่าวาสุกรี",
            "postalCode": "13000"
          },
          {
            "name": "ไผ่ลิง",
            "postalCode": "13000"
          },
          {
            "name": "ปากกราน",
            "postalCode": "13000"
          },
          {
            "name": "ภูเขาทอง",
            "postalCode": "13000"
          },
          {
            "name": "สำเภาล่ม",
            "postalCode": "13000"
          },
          {
            "name": "สวนพริก",
            "postalCode": "13000"
          },
          {
            "name": "คลองตะเคียน",
            "postalCode": "13000"
          },
          {
            "name": "วัดตูม",
            "postalCode": "13000"
          },
          {
            "name": "หันตรา",
            "postalCode": "13000"
          },
          {
            "name": "ลุมพลี",
            "postalCode": "13000"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "13000"
          },
          {
            "name": "บ้านเกาะ",
            "postalCode": "13000"
          },
          {
            "name": "คลองสวนพลู",
            "postalCode": "13000"
          },
          {
            "name": "คลองสระบัว",
            "postalCode": "13000"
          },
          {
            "name": "เกาะเรียน",
            "postalCode": "13000"
          },
          {
            "name": "บ้านป้อม",
            "postalCode": "13000"
          },
          {
            "name": "บ้านรุน",
            "postalCode": "13000"
          }
        ]
      },
      {
        "name": "ท่าเรือ",
        "subDistricts": [
          {
            "name": "ท่าเรือ",
            "postalCode": "13130"
          },
          {
            "name": "จำปา",
            "postalCode": "13130"
          },
          {
            "name": "ท่าหลวง",
            "postalCode": "13130"
          },
          {
            "name": "บ้านร่อม",
            "postalCode": "13130"
          },
          {
            "name": "ศาลาลอย",
            "postalCode": "13130"
          },
          {
            "name": "วังแดง",
            "postalCode": "13130"
          },
          {
            "name": "โพธิ์เอน",
            "postalCode": "13130"
          },
          {
            "name": "ปากท่า",
            "postalCode": "13130"
          },
          {
            "name": "หนองขนาก",
            "postalCode": "13130"
          },
          {
            "name": "ท่าเจ้าสนุก",
            "postalCode": "13130"
          }
        ]
      },
      {
        "name": "นครหลวง",
        "subDistricts": [
          {
            "name": "นครหลวง",
            "postalCode": "13260"
          },
          {
            "name": "ท่าช้าง",
            "postalCode": "13260"
          },
          {
            "name": "บ่อโพง",
            "postalCode": "13260"
          },
          {
            "name": "บ้านชุ้ง",
            "postalCode": "13260"
          },
          {
            "name": "ปากจั่น",
            "postalCode": "13260"
          },
          {
            "name": "บางระกำ",
            "postalCode": "13260"
          },
          {
            "name": "บางพระครู",
            "postalCode": "13260"
          },
          {
            "name": "แม่ลา",
            "postalCode": "13260"
          },
          {
            "name": "หนองปลิง",
            "postalCode": "13260"
          },
          {
            "name": "คลองสะแก",
            "postalCode": "13260"
          },
          {
            "name": "สามไถ",
            "postalCode": "13260"
          },
          {
            "name": "พระนอน",
            "postalCode": "13260"
          }
        ]
      },
      {
        "name": "บางไทร",
        "subDistricts": [
          {
            "name": "บางไทร",
            "postalCode": "13190"
          },
          {
            "name": "บางพลี",
            "postalCode": "13190"
          },
          {
            "name": "สนามชัย",
            "postalCode": "13190"
          },
          {
            "name": "บ้านแป้ง",
            "postalCode": "13190"
          },
          {
            "name": "หน้าไม้",
            "postalCode": "13190"
          },
          {
            "name": "บางยี่โท",
            "postalCode": "13190"
          },
          {
            "name": "แคออก",
            "postalCode": "13190"
          },
          {
            "name": "แคตก",
            "postalCode": "13190"
          },
          {
            "name": "ช่างเหล็ก",
            "postalCode": "13190"
          },
          {
            "name": "กระแชง",
            "postalCode": "13190"
          },
          {
            "name": "บ้านกลึง",
            "postalCode": "13190"
          },
          {
            "name": "ช้างน้อย",
            "postalCode": "13190"
          },
          {
            "name": "ห่อหมก",
            "postalCode": "13190"
          },
          {
            "name": "ไผ่พระ",
            "postalCode": "13190"
          },
          {
            "name": "กกแก้วบูรพา",
            "postalCode": "13190"
          },
          {
            "name": "ไม้ตรา",
            "postalCode": "13190"
          },
          {
            "name": "บ้านม้า",
            "postalCode": "13190"
          },
          {
            "name": "บ้านเกาะ",
            "postalCode": "13190"
          },
          {
            "name": "ราชคราม",
            "postalCode": "13290"
          },
          {
            "name": "ช้างใหญ่",
            "postalCode": "13290"
          },
          {
            "name": "โพแตง",
            "postalCode": "13290"
          },
          {
            "name": "เชียงรากน้อย",
            "postalCode": "13290"
          },
          {
            "name": "โคกช้าง",
            "postalCode": "13190"
          }
        ]
      },
      {
        "name": "บางบาล",
        "subDistricts": [
          {
            "name": "บางบาล",
            "postalCode": "13250"
          },
          {
            "name": "วัดยม",
            "postalCode": "13250"
          },
          {
            "name": "ไทรน้อย",
            "postalCode": "13250"
          },
          {
            "name": "สะพานไทย",
            "postalCode": "13250"
          },
          {
            "name": "มหาพราหมณ์",
            "postalCode": "13250"
          },
          {
            "name": "กบเจา",
            "postalCode": "13250"
          },
          {
            "name": "บ้านคลัง",
            "postalCode": "13250"
          },
          {
            "name": "พระขาว",
            "postalCode": "13250"
          },
          {
            "name": "น้ำเต้า",
            "postalCode": "13250"
          },
          {
            "name": "ทางช้าง",
            "postalCode": "13250"
          },
          {
            "name": "วัดตะกู",
            "postalCode": "13250"
          },
          {
            "name": "บางหลวง",
            "postalCode": "13250"
          },
          {
            "name": "บางหลวงโดด",
            "postalCode": "13250"
          },
          {
            "name": "บางหัก",
            "postalCode": "13250"
          },
          {
            "name": "บางชะนี",
            "postalCode": "13250"
          },
          {
            "name": "บ้านกุ่ม",
            "postalCode": "13250"
          }
        ]
      },
      {
        "name": "บางปะอิน",
        "subDistricts": [
          {
            "name": "บ้านเลน",
            "postalCode": "13160"
          },
          {
            "name": "เชียงรากน้อย",
            "postalCode": "13180"
          },
          {
            "name": "บ้านโพ",
            "postalCode": "13160"
          },
          {
            "name": "บ้านกรด",
            "postalCode": "13160"
          },
          {
            "name": "บางกระสั้น",
            "postalCode": "13160"
          },
          {
            "name": "คลองจิก",
            "postalCode": "13160"
          },
          {
            "name": "บ้านหว้า",
            "postalCode": "13160"
          },
          {
            "name": "วัดยม",
            "postalCode": "13160"
          },
          {
            "name": "บางประแดง",
            "postalCode": "13160"
          },
          {
            "name": "สามเรือน",
            "postalCode": "13160"
          },
          {
            "name": "เกาะเกิด",
            "postalCode": "13160"
          },
          {
            "name": "บ้านพลับ",
            "postalCode": "13160"
          },
          {
            "name": "บ้านแป้ง",
            "postalCode": "13160"
          },
          {
            "name": "คุ้งลาน",
            "postalCode": "13160"
          },
          {
            "name": "ตลิ่งชัน",
            "postalCode": "13160"
          },
          {
            "name": "บ้านสร้าง",
            "postalCode": "13170"
          },
          {
            "name": "ตลาดเกรียบ",
            "postalCode": "13160"
          },
          {
            "name": "ขนอนหลวง",
            "postalCode": "13160"
          }
        ]
      },
      {
        "name": "บางปะหัน",
        "subDistricts": [
          {
            "name": "บางปะหัน",
            "postalCode": "13220"
          },
          {
            "name": "ขยาย",
            "postalCode": "13220"
          },
          {
            "name": "บางเดื่อ",
            "postalCode": "13220"
          },
          {
            "name": "เสาธง",
            "postalCode": "13220"
          },
          {
            "name": "ทางกลาง",
            "postalCode": "13220"
          },
          {
            "name": "บางเพลิง",
            "postalCode": "13220"
          },
          {
            "name": "หันสัง",
            "postalCode": "13220"
          },
          {
            "name": "บางนางร้า",
            "postalCode": "13220"
          },
          {
            "name": "ตานิม",
            "postalCode": "13220"
          },
          {
            "name": "ทับน้ำ",
            "postalCode": "13220"
          },
          {
            "name": "บ้านม้า",
            "postalCode": "13220"
          },
          {
            "name": "ขวัญเมือง",
            "postalCode": "13220"
          },
          {
            "name": "บ้านลี่",
            "postalCode": "13220"
          },
          {
            "name": "โพธิ์สามต้น",
            "postalCode": "13220"
          },
          {
            "name": "พุทเลา",
            "postalCode": "13220"
          },
          {
            "name": "ตาลเอน",
            "postalCode": "13220"
          },
          {
            "name": "บ้านขล้อ",
            "postalCode": "13220"
          }
        ]
      },
      {
        "name": "ผักไห่",
        "subDistricts": [
          {
            "name": "ผักไห่",
            "postalCode": "13120"
          },
          {
            "name": "อมฤต",
            "postalCode": "13120"
          },
          {
            "name": "บ้านแค",
            "postalCode": "13120"
          },
          {
            "name": "ลาดน้ำเค็ม",
            "postalCode": "13120"
          },
          {
            "name": "ตาลาน",
            "postalCode": "13120"
          },
          {
            "name": "ท่าดินแดง",
            "postalCode": "13120"
          },
          {
            "name": "ดอนลาน",
            "postalCode": "13280"
          },
          {
            "name": "นาคู",
            "postalCode": "13280"
          },
          {
            "name": "กุฎี",
            "postalCode": "13120"
          },
          {
            "name": "ลำตะเคียน",
            "postalCode": "13280"
          },
          {
            "name": "โคกช้าง",
            "postalCode": "13120"
          },
          {
            "name": "จักราช",
            "postalCode": "13280"
          },
          {
            "name": "หนองน้ำใหญ่",
            "postalCode": "13280"
          },
          {
            "name": "ลาดชิด",
            "postalCode": "13120"
          },
          {
            "name": "หน้าโคก",
            "postalCode": "13120"
          },
          {
            "name": "บ้านใหญ่",
            "postalCode": "13120"
          }
        ]
      },
      {
        "name": "ภาชี",
        "subDistricts": [
          {
            "name": "ภาชี",
            "postalCode": "13140"
          },
          {
            "name": "โคกม่วง",
            "postalCode": "13140"
          },
          {
            "name": "ระโสม",
            "postalCode": "13140"
          },
          {
            "name": "หนองน้ำใส",
            "postalCode": "13140"
          },
          {
            "name": "ดอนหญ้านาง",
            "postalCode": "13140"
          },
          {
            "name": "ไผ่ล้อม",
            "postalCode": "13140"
          },
          {
            "name": "กระจิว",
            "postalCode": "13140"
          },
          {
            "name": "พระแก้ว",
            "postalCode": "13140"
          }
        ]
      },
      {
        "name": "ลาดบัวหลวง",
        "subDistricts": [
          {
            "name": "ลาดบัวหลวง",
            "postalCode": "13230"
          },
          {
            "name": "หลักชัย",
            "postalCode": "13230"
          },
          {
            "name": "สามเมือง",
            "postalCode": "13230"
          },
          {
            "name": "พระยาบันลือ",
            "postalCode": "13230"
          },
          {
            "name": "สิงหนาท",
            "postalCode": "13230"
          },
          {
            "name": "คู้สลอด",
            "postalCode": "13230"
          },
          {
            "name": "คลองพระยาบันลือ",
            "postalCode": "13230"
          }
        ]
      },
      {
        "name": "วังน้อย",
        "subDistricts": [
          {
            "name": "ลำตาเสา",
            "postalCode": "13170"
          },
          {
            "name": "บ่อตาโล่",
            "postalCode": "13170"
          },
          {
            "name": "วังน้อย",
            "postalCode": "13170"
          },
          {
            "name": "ลำไทร",
            "postalCode": "13170"
          },
          {
            "name": "สนับทึบ",
            "postalCode": "13170"
          },
          {
            "name": "พยอม",
            "postalCode": "13170"
          },
          {
            "name": "หันตะเภา",
            "postalCode": "13170"
          },
          {
            "name": "วังจุฬา",
            "postalCode": "13170"
          },
          {
            "name": "ข้าวงาม",
            "postalCode": "13170"
          },
          {
            "name": "ชะแมบ",
            "postalCode": "13170"
          }
        ]
      },
      {
        "name": "เสนา",
        "subDistricts": [
          {
            "name": "เสนา",
            "postalCode": "13110"
          },
          {
            "name": "บ้านแพน",
            "postalCode": "13110"
          },
          {
            "name": "เจ้าเจ็ด",
            "postalCode": "13110"
          },
          {
            "name": "สามกอ",
            "postalCode": "13110"
          },
          {
            "name": "บางนมโค",
            "postalCode": "13110"
          },
          {
            "name": "หัวเวียง",
            "postalCode": "13110"
          },
          {
            "name": "มารวิชัย",
            "postalCode": "13110"
          },
          {
            "name": "บ้านโพธิ์",
            "postalCode": "13110"
          },
          {
            "name": "รางจรเข้",
            "postalCode": "13110"
          },
          {
            "name": "บ้านกระทุ่ม",
            "postalCode": "13110"
          },
          {
            "name": "บ้านแถว",
            "postalCode": "13110"
          },
          {
            "name": "ชายนา",
            "postalCode": "13110"
          },
          {
            "name": "สามตุ่ม",
            "postalCode": "13110"
          },
          {
            "name": "ลาดงา",
            "postalCode": "13110"
          },
          {
            "name": "ดอนทอง",
            "postalCode": "13110"
          },
          {
            "name": "บ้านหลวง",
            "postalCode": "13110"
          },
          {
            "name": "เจ้าเสด็จ",
            "postalCode": "13110"
          }
        ]
      },
      {
        "name": "บางซ้าย",
        "subDistricts": [
          {
            "name": "บางซ้าย",
            "postalCode": "13270"
          },
          {
            "name": "แก้วฟ้า",
            "postalCode": "13270"
          },
          {
            "name": "เต่าเล่า",
            "postalCode": "13270"
          },
          {
            "name": "ปลายกลัด",
            "postalCode": "13270"
          },
          {
            "name": "เทพมงคล",
            "postalCode": "13270"
          },
          {
            "name": "วังพัฒนา",
            "postalCode": "13270"
          }
        ]
      },
      {
        "name": "อุทัย",
        "subDistricts": [
          {
            "name": "คานหาม",
            "postalCode": "13210"
          },
          {
            "name": "บ้านช้าง",
            "postalCode": "13210"
          },
          {
            "name": "สามบัณฑิต",
            "postalCode": "13210"
          },
          {
            "name": "บ้านหีบ",
            "postalCode": "13210"
          },
          {
            "name": "หนองไม้ซุง",
            "postalCode": "13210"
          },
          {
            "name": "อุทัย",
            "postalCode": "13210"
          },
          {
            "name": "เสนา",
            "postalCode": "13210"
          },
          {
            "name": "หนองน้ำส้ม",
            "postalCode": "13210"
          },
          {
            "name": "โพสาวหาญ",
            "postalCode": "13210"
          },
          {
            "name": "ธนู",
            "postalCode": "13210"
          },
          {
            "name": "ข้าวเม่า",
            "postalCode": "13210"
          }
        ]
      },
      {
        "name": "มหาราช",
        "subDistricts": [
          {
            "name": "หัวไผ่",
            "postalCode": "13150"
          },
          {
            "name": "กะทุ่ม",
            "postalCode": "13150"
          },
          {
            "name": "มหาราช",
            "postalCode": "13150"
          },
          {
            "name": "น้ำเต้า",
            "postalCode": "13150"
          },
          {
            "name": "บางนา",
            "postalCode": "13150"
          },
          {
            "name": "โรงช้าง",
            "postalCode": "13150"
          },
          {
            "name": "เจ้าปลุก",
            "postalCode": "13150"
          },
          {
            "name": "พิตเพียน",
            "postalCode": "13150"
          },
          {
            "name": "บ้านนา",
            "postalCode": "13150"
          },
          {
            "name": "บ้านขวาง",
            "postalCode": "13150"
          },
          {
            "name": "ท่าตอ",
            "postalCode": "13150"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "13150"
          }
        ]
      },
      {
        "name": "บ้านแพรก",
        "subDistricts": [
          {
            "name": "บ้านแพรก",
            "postalCode": "13240"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "13240"
          },
          {
            "name": "สำพะเนียง",
            "postalCode": "13240"
          },
          {
            "name": "คลองน้อย",
            "postalCode": "13240"
          },
          {
            "name": "สองห้อง",
            "postalCode": "13240"
          }
        ]
      }
    ]
  },
  {
    "name": "อ่างทอง",
    "districts": [
      {
        "name": "เมืองอ่างทอง",
        "subDistricts": [
          {
            "name": "ตลาดหลวง",
            "postalCode": "14000"
          },
          {
            "name": "บางแก้ว",
            "postalCode": "14000"
          },
          {
            "name": "ศาลาแดง",
            "postalCode": "14000"
          },
          {
            "name": "ป่างิ้ว",
            "postalCode": "14000"
          },
          {
            "name": "บ้านแห",
            "postalCode": "14000"
          },
          {
            "name": "ตลาดกรวด",
            "postalCode": "14000"
          },
          {
            "name": "มหาดไทย",
            "postalCode": "14000"
          },
          {
            "name": "บ้านอิฐ",
            "postalCode": "14000"
          },
          {
            "name": "หัวไผ่",
            "postalCode": "14000"
          },
          {
            "name": "จำปาหล่อ",
            "postalCode": "14000"
          },
          {
            "name": "โพสะ",
            "postalCode": "14000"
          },
          {
            "name": "บ้านรี",
            "postalCode": "14000"
          },
          {
            "name": "คลองวัว",
            "postalCode": "14000"
          },
          {
            "name": "ย่านซื่อ",
            "postalCode": "14000"
          }
        ]
      },
      {
        "name": "ไชโย",
        "subDistricts": [
          {
            "name": "จรเข้ร้อง",
            "postalCode": "14140"
          },
          {
            "name": "ไชยภูมิ",
            "postalCode": "14140"
          },
          {
            "name": "ชัยฤทธิ์",
            "postalCode": "14140"
          },
          {
            "name": "เทวราช",
            "postalCode": "14140"
          },
          {
            "name": "ราชสถิตย์",
            "postalCode": "14140"
          },
          {
            "name": "ไชโย",
            "postalCode": "14140"
          },
          {
            "name": "หลักฟ้า",
            "postalCode": "14140"
          },
          {
            "name": "ชะไว",
            "postalCode": "14140"
          },
          {
            "name": "ตรีณรงค์",
            "postalCode": "14140"
          }
        ]
      },
      {
        "name": "ป่าโมก",
        "subDistricts": [
          {
            "name": "บางปลากด",
            "postalCode": "14130"
          },
          {
            "name": "ป่าโมก",
            "postalCode": "14130"
          },
          {
            "name": "สายทอง",
            "postalCode": "14130"
          },
          {
            "name": "โรงช้าง",
            "postalCode": "14130"
          },
          {
            "name": "บางเสด็จ",
            "postalCode": "14130"
          },
          {
            "name": "นรสิงห์",
            "postalCode": "14130"
          },
          {
            "name": "เอกราช",
            "postalCode": "14130"
          },
          {
            "name": "โผงเผง",
            "postalCode": "14130"
          }
        ]
      },
      {
        "name": "โพธิ์ทอง",
        "subDistricts": [
          {
            "name": "อ่างแก้ว",
            "postalCode": "14120"
          },
          {
            "name": "อินทประมูล",
            "postalCode": "14120"
          },
          {
            "name": "บางพลับ",
            "postalCode": "14120"
          },
          {
            "name": "หนองแม่ไก่",
            "postalCode": "14120"
          },
          {
            "name": "รำมะสัก",
            "postalCode": "14120"
          },
          {
            "name": "บางระกำ",
            "postalCode": "14120"
          },
          {
            "name": "โพธิ์รังนก",
            "postalCode": "14120"
          },
          {
            "name": "องครักษ์",
            "postalCode": "14120"
          },
          {
            "name": "โคกพุทรา",
            "postalCode": "14120"
          },
          {
            "name": "ยางช้าย",
            "postalCode": "14120"
          },
          {
            "name": "บ่อแร่",
            "postalCode": "14120"
          },
          {
            "name": "ทางพระ",
            "postalCode": "14120"
          },
          {
            "name": "สามง่าม",
            "postalCode": "14120"
          },
          {
            "name": "บางเจ้าฉ่า",
            "postalCode": "14120"
          },
          {
            "name": "คำหยาด",
            "postalCode": "14120"
          }
        ]
      },
      {
        "name": "แสวงหา",
        "subDistricts": [
          {
            "name": "แสวงหา",
            "postalCode": "14150"
          },
          {
            "name": "ศรีพราน",
            "postalCode": "14150"
          },
          {
            "name": "บ้านพราน",
            "postalCode": "14150"
          },
          {
            "name": "วังน้ำเย็น",
            "postalCode": "14150"
          },
          {
            "name": "สีบัวทอง",
            "postalCode": "14150"
          },
          {
            "name": "ห้วยไผ่",
            "postalCode": "14150"
          },
          {
            "name": "จำลอง",
            "postalCode": "14150"
          }
        ]
      },
      {
        "name": "วิเศษชัยชาญ",
        "subDistricts": [
          {
            "name": "ไผ่จำศิล",
            "postalCode": "14110"
          },
          {
            "name": "ศาลเจ้าโรงทอง",
            "postalCode": "14110"
          },
          {
            "name": "ไผ่ดำพัฒนา",
            "postalCode": "14110"
          },
          {
            "name": "สาวร้องไห้",
            "postalCode": "14110"
          },
          {
            "name": "ท่าช้าง",
            "postalCode": "14110"
          },
          {
            "name": "ยี่ล้น",
            "postalCode": "14110"
          },
          {
            "name": "บางจัก",
            "postalCode": "14110"
          },
          {
            "name": "ห้วยคันแหลน",
            "postalCode": "14110"
          },
          {
            "name": "คลองขนาก",
            "postalCode": "14110"
          },
          {
            "name": "ไผ่วง",
            "postalCode": "14110"
          },
          {
            "name": "สี่ร้อย",
            "postalCode": "14110"
          },
          {
            "name": "ม่วงเตี้ย",
            "postalCode": "14110"
          },
          {
            "name": "หัวตะพาน",
            "postalCode": "14110"
          },
          {
            "name": "หลักแก้ว",
            "postalCode": "14110"
          },
          {
            "name": "ตลาดใหม่",
            "postalCode": "14110"
          }
        ]
      },
      {
        "name": "สามโก้",
        "subDistricts": [
          {
            "name": "สามโก้",
            "postalCode": "14160"
          },
          {
            "name": "ราษฎรพัฒนา",
            "postalCode": "14160"
          },
          {
            "name": "อบทม",
            "postalCode": "14160"
          },
          {
            "name": "โพธิ์ม่วงพันธ์",
            "postalCode": "14160"
          },
          {
            "name": "มงคลธรรมนิมิต",
            "postalCode": "14160"
          }
        ]
      }
    ]
  },
  {
    "name": "ลพบุรี",
    "districts": [
      {
        "name": "เมืองลพบุรี",
        "subDistricts": [
          {
            "name": "ทะเลชุบศร",
            "postalCode": "15000"
          },
          {
            "name": "ท่าหิน",
            "postalCode": "15000"
          },
          {
            "name": "กกโก",
            "postalCode": "15000"
          },
          {
            "name": "โก่งธนู",
            "postalCode": "13240"
          },
          {
            "name": "เขาพระงาม",
            "postalCode": "15000"
          },
          {
            "name": "เขาสามยอด",
            "postalCode": "15000"
          },
          {
            "name": "โคกกะเทียม",
            "postalCode": "15000"
          },
          {
            "name": "โคกลำพาน",
            "postalCode": "15000"
          },
          {
            "name": "โคกตูม",
            "postalCode": "15210"
          },
          {
            "name": "งิ้วราย",
            "postalCode": "15000"
          },
          {
            "name": "ดอนโพธิ์",
            "postalCode": "15000"
          },
          {
            "name": "ตะลุง",
            "postalCode": "15000"
          },
          {
            "name": "ท่าแค",
            "postalCode": "15000"
          },
          {
            "name": "ท่าศาลา",
            "postalCode": "15000"
          },
          {
            "name": "นิคมสร้างตนเอง",
            "postalCode": "15000"
          },
          {
            "name": "บางขันหมาก",
            "postalCode": "15000"
          },
          {
            "name": "บ้านข่อย",
            "postalCode": "15000"
          },
          {
            "name": "ท้ายตลาด",
            "postalCode": "15000"
          },
          {
            "name": "ป่าตาล",
            "postalCode": "15000"
          },
          {
            "name": "พรหมมาสตร์",
            "postalCode": "15000"
          },
          {
            "name": "โพธิ์เก้าต้น",
            "postalCode": "15000"
          },
          {
            "name": "โพธิ์ตรุ",
            "postalCode": "15000"
          },
          {
            "name": "สี่คลอง",
            "postalCode": "15000"
          },
          {
            "name": "ถนนใหญ่",
            "postalCode": "15000"
          }
        ]
      },
      {
        "name": "พัฒนานิคม",
        "subDistricts": [
          {
            "name": "พัฒนานิคม",
            "postalCode": "15140"
          },
          {
            "name": "ช่องสาริกา",
            "postalCode": "15220"
          },
          {
            "name": "มะนาวหวาน",
            "postalCode": "15140"
          },
          {
            "name": "ดีลัง",
            "postalCode": "15220"
          },
          {
            "name": "โคกสลุง",
            "postalCode": "15140"
          },
          {
            "name": "ชอนน้อย",
            "postalCode": "15140"
          },
          {
            "name": "หนองบัว",
            "postalCode": "15140"
          },
          {
            "name": "ห้วยขุนราม",
            "postalCode": "18220"
          },
          {
            "name": "น้ำสุด",
            "postalCode": "15140"
          }
        ]
      },
      {
        "name": "โคกสำโรง",
        "subDistricts": [
          {
            "name": "โคกสำโรง",
            "postalCode": "15120"
          },
          {
            "name": "เกาะแก้ว",
            "postalCode": "15120"
          },
          {
            "name": "ถลุงเหล็ก",
            "postalCode": "15120"
          },
          {
            "name": "หลุมข้าว",
            "postalCode": "15120"
          },
          {
            "name": "ห้วยโป่ง",
            "postalCode": "15120"
          },
          {
            "name": "คลองเกตุ",
            "postalCode": "15120"
          },
          {
            "name": "สะแกราบ",
            "postalCode": "15120"
          },
          {
            "name": "เพนียด",
            "postalCode": "15120"
          },
          {
            "name": "วังเพลิง",
            "postalCode": "15120"
          },
          {
            "name": "ดงมะรุม",
            "postalCode": "15120"
          },
          {
            "name": "วังขอนขว้าง",
            "postalCode": "15120"
          },
          {
            "name": "วังจั่น",
            "postalCode": "15120"
          },
          {
            "name": "หนองแขม",
            "postalCode": "15120"
          }
        ]
      },
      {
        "name": "ชัยบาดาล",
        "subDistricts": [
          {
            "name": "ลำนารายณ์",
            "postalCode": "15130"
          },
          {
            "name": "ชัยนารายณ์",
            "postalCode": "15130"
          },
          {
            "name": "ศิลาทิพย์",
            "postalCode": "15130"
          },
          {
            "name": "ห้วยหิน",
            "postalCode": "15130"
          },
          {
            "name": "ม่วงค่อม",
            "postalCode": "15230"
          },
          {
            "name": "บัวชุม",
            "postalCode": "15130"
          },
          {
            "name": "ท่าดินดำ",
            "postalCode": "15130"
          },
          {
            "name": "มะกอกหวาน",
            "postalCode": "15230"
          },
          {
            "name": "ซับตะเคียน",
            "postalCode": "15130"
          },
          {
            "name": "นาโสม",
            "postalCode": "15190"
          },
          {
            "name": "หนองยายโต๊ะ",
            "postalCode": "15130"
          },
          {
            "name": "เกาะรัง",
            "postalCode": "15130"
          },
          {
            "name": "ท่ามะนาว",
            "postalCode": "15130"
          },
          {
            "name": "นิคมลำนารายณ์",
            "postalCode": "15130"
          },
          {
            "name": "ชัยบาดาล",
            "postalCode": "15230"
          },
          {
            "name": "บ้านใหม่สามัคคี",
            "postalCode": "15130"
          },
          {
            "name": "เขาแหลม",
            "postalCode": "15130"
          }
        ]
      },
      {
        "name": "ท่าวุ้ง",
        "subDistricts": [
          {
            "name": "ท่าวุ้ง",
            "postalCode": "15150"
          },
          {
            "name": "บางคู้",
            "postalCode": "15150"
          },
          {
            "name": "โพตลาดแก้ว",
            "postalCode": "15150"
          },
          {
            "name": "บางลี่",
            "postalCode": "15150"
          },
          {
            "name": "บางงา",
            "postalCode": "15150"
          },
          {
            "name": "โคกสลุด",
            "postalCode": "15150"
          },
          {
            "name": "เขาสมอคอน",
            "postalCode": "15180"
          },
          {
            "name": "หัวสำโรง",
            "postalCode": "15150"
          },
          {
            "name": "ลาดสาลี่",
            "postalCode": "15150"
          },
          {
            "name": "บ้านเบิก",
            "postalCode": "15150"
          },
          {
            "name": "มุจลินท์",
            "postalCode": "15150"
          }
        ]
      },
      {
        "name": "บ้านหมี่",
        "subDistricts": [
          {
            "name": "ไผ่ใหญ่",
            "postalCode": "15110"
          },
          {
            "name": "บ้านทราย",
            "postalCode": "15110"
          },
          {
            "name": "บ้านกล้วย",
            "postalCode": "15110"
          },
          {
            "name": "ดงพลับ",
            "postalCode": "15110"
          },
          {
            "name": "บ้านชี",
            "postalCode": "15180"
          },
          {
            "name": "พุคา",
            "postalCode": "15110"
          },
          {
            "name": "หินปัก",
            "postalCode": "15110"
          },
          {
            "name": "บางพึ่ง",
            "postalCode": "15110"
          },
          {
            "name": "หนองทรายขาว",
            "postalCode": "15110"
          },
          {
            "name": "บางกะพี้",
            "postalCode": "15110"
          },
          {
            "name": "หนองเต่า",
            "postalCode": "15110"
          },
          {
            "name": "โพนทอง",
            "postalCode": "15110"
          },
          {
            "name": "บางขาม",
            "postalCode": "15180"
          },
          {
            "name": "ดอนดึง",
            "postalCode": "15110"
          },
          {
            "name": "ชอนม่วง",
            "postalCode": "15110"
          },
          {
            "name": "หนองกระเบียน",
            "postalCode": "15110"
          },
          {
            "name": "สายห้วยแก้ว",
            "postalCode": "15110"
          },
          {
            "name": "มหาสอน",
            "postalCode": "15110"
          },
          {
            "name": "บ้านหมี่",
            "postalCode": "15110"
          },
          {
            "name": "เชียงงา",
            "postalCode": "15110"
          },
          {
            "name": "หนองเมือง",
            "postalCode": "15110"
          },
          {
            "name": "สนามแจง",
            "postalCode": "15110"
          }
        ]
      },
      {
        "name": "ท่าหลวง",
        "subDistricts": [
          {
            "name": "ท่าหลวง",
            "postalCode": "15230"
          },
          {
            "name": "แก่งผักกูด",
            "postalCode": "15230"
          },
          {
            "name": "ซับจำปา",
            "postalCode": "15230"
          },
          {
            "name": "หนองผักแว่น",
            "postalCode": "15230"
          },
          {
            "name": "ทะเลวังวัด",
            "postalCode": "15230"
          },
          {
            "name": "หัวลำ",
            "postalCode": "15230"
          }
        ]
      },
      {
        "name": "สระโบสถ์",
        "subDistricts": [
          {
            "name": "สระโบสถ์",
            "postalCode": "15240"
          },
          {
            "name": "มหาโพธิ",
            "postalCode": "15240"
          },
          {
            "name": "ทุ่งท่าช้าง",
            "postalCode": "15240"
          },
          {
            "name": "ห้วยใหญ่",
            "postalCode": "15240"
          },
          {
            "name": "นิยมชัย",
            "postalCode": "15240"
          }
        ]
      },
      {
        "name": "โคกเจริญ",
        "subDistricts": [
          {
            "name": "โคกเจริญ",
            "postalCode": "15250"
          },
          {
            "name": "ยางราก",
            "postalCode": "15250"
          },
          {
            "name": "หนองมะค่า",
            "postalCode": "15250"
          },
          {
            "name": "วังทอง",
            "postalCode": "15250"
          },
          {
            "name": "โคกแสมสาร",
            "postalCode": "15250"
          }
        ]
      },
      {
        "name": "ลำสนธิ",
        "subDistricts": [
          {
            "name": "ลำสนธิ",
            "postalCode": "15190"
          },
          {
            "name": "ซับสมบูรณ์",
            "postalCode": "15190"
          },
          {
            "name": "หนองรี",
            "postalCode": "15190"
          },
          {
            "name": "กุดตาเพชร",
            "postalCode": "15190"
          },
          {
            "name": "เขารวก",
            "postalCode": "15190"
          },
          {
            "name": "เขาน้อย",
            "postalCode": "15130"
          }
        ]
      },
      {
        "name": "หนองม่วง",
        "subDistricts": [
          {
            "name": "หนองม่วง",
            "postalCode": "15170"
          },
          {
            "name": "บ่อทอง",
            "postalCode": "15170"
          },
          {
            "name": "ดงดินแดง",
            "postalCode": "15170"
          },
          {
            "name": "ชอนสมบูรณ์",
            "postalCode": "15170"
          },
          {
            "name": "ยางโทน",
            "postalCode": "15170"
          },
          {
            "name": "ชอนสารเดช",
            "postalCode": "15170"
          }
        ]
      }
    ]
  },
  {
    "name": "สิงห์บุรี",
    "districts": [
      {
        "name": "เมืองสิงห์บุรี",
        "subDistricts": [
          {
            "name": "บางพุทรา",
            "postalCode": "16000"
          },
          {
            "name": "บางมัญ",
            "postalCode": "16000"
          },
          {
            "name": "โพกรวม",
            "postalCode": "16000"
          },
          {
            "name": "ม่วงหมู่",
            "postalCode": "16000"
          },
          {
            "name": "หัวไผ่",
            "postalCode": "16000"
          },
          {
            "name": "ต้นโพธิ์",
            "postalCode": "16000"
          },
          {
            "name": "จักรสีห์",
            "postalCode": "16000"
          },
          {
            "name": "บางกระบือ",
            "postalCode": "16000"
          }
        ]
      },
      {
        "name": "บางระจัน",
        "subDistricts": [
          {
            "name": "สิงห์",
            "postalCode": "16130"
          },
          {
            "name": "ไม้ดัด",
            "postalCode": "16130"
          },
          {
            "name": "เชิงกลัด",
            "postalCode": "16130"
          },
          {
            "name": "โพชนไก่",
            "postalCode": "16130"
          },
          {
            "name": "แม่ลา",
            "postalCode": "16130"
          },
          {
            "name": "บ้านจ่า",
            "postalCode": "16130"
          },
          {
            "name": "พักทัน",
            "postalCode": "16130"
          },
          {
            "name": "สระแจง",
            "postalCode": "16130"
          }
        ]
      },
      {
        "name": "ค่ายบางระจัน",
        "subDistricts": [
          {
            "name": "โพทะเล",
            "postalCode": "16150"
          },
          {
            "name": "บางระจัน",
            "postalCode": "16150"
          },
          {
            "name": "โพสังโฆ",
            "postalCode": "16150"
          },
          {
            "name": "ท่าข้าม",
            "postalCode": "16150"
          },
          {
            "name": "คอทราย",
            "postalCode": "16150"
          },
          {
            "name": "หนองกระทุ่ม",
            "postalCode": "16150"
          }
        ]
      },
      {
        "name": "พรหมบุรี",
        "subDistricts": [
          {
            "name": "พระงาม",
            "postalCode": "16120"
          },
          {
            "name": "พรหมบุรี",
            "postalCode": "16160"
          },
          {
            "name": "บางน้ำเชี่ยว",
            "postalCode": "16120"
          },
          {
            "name": "บ้านหม้อ",
            "postalCode": "16120"
          },
          {
            "name": "บ้านแป้ง",
            "postalCode": "16120"
          },
          {
            "name": "หัวป่า",
            "postalCode": "16120"
          },
          {
            "name": "โรงช้าง",
            "postalCode": "16120"
          }
        ]
      },
      {
        "name": "ท่าช้าง",
        "subDistricts": [
          {
            "name": "ถอนสมอ",
            "postalCode": "16140"
          },
          {
            "name": "โพประจักษ์",
            "postalCode": "16140"
          },
          {
            "name": "วิหารขาว",
            "postalCode": "16140"
          },
          {
            "name": "พิกุลทอง",
            "postalCode": "16140"
          }
        ]
      },
      {
        "name": "อินทร์บุรี",
        "subDistricts": [
          {
            "name": "อินทร์บุรี",
            "postalCode": "16110"
          },
          {
            "name": "ประศุก",
            "postalCode": "16110"
          },
          {
            "name": "ทับยา",
            "postalCode": "16110"
          },
          {
            "name": "งิ้วราย",
            "postalCode": "16110"
          },
          {
            "name": "ชีน้ำร้าย",
            "postalCode": "16110"
          },
          {
            "name": "ท่างาม",
            "postalCode": "16110"
          },
          {
            "name": "น้ำตาล",
            "postalCode": "16110"
          },
          {
            "name": "ทองเอน",
            "postalCode": "16110"
          },
          {
            "name": "ห้วยชัน",
            "postalCode": "16110"
          },
          {
            "name": "โพธิ์ชัย",
            "postalCode": "16110"
          }
        ]
      }
    ]
  },
  {
    "name": "ชัยนาท",
    "districts": [
      {
        "name": "เมืองชัยนาท",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "17000"
          },
          {
            "name": "บ้านกล้วย",
            "postalCode": "17000"
          },
          {
            "name": "ท่าชัย",
            "postalCode": "17000"
          },
          {
            "name": "ชัยนาท",
            "postalCode": "17000"
          },
          {
            "name": "เขาท่าพระ",
            "postalCode": "17000"
          },
          {
            "name": "หาดท่าเสา",
            "postalCode": "17000"
          },
          {
            "name": "ธรรมามูล",
            "postalCode": "17000"
          },
          {
            "name": "เสือโฮก",
            "postalCode": "17000"
          },
          {
            "name": "นางลือ",
            "postalCode": "17000"
          }
        ]
      },
      {
        "name": "มโนรมย์",
        "subDistricts": [
          {
            "name": "คุ้งสำเภา",
            "postalCode": "17110"
          },
          {
            "name": "วัดโคก",
            "postalCode": "17110"
          },
          {
            "name": "ศิลาดาน",
            "postalCode": "17110"
          },
          {
            "name": "ท่าฉนวน",
            "postalCode": "17110"
          },
          {
            "name": "หางน้ำสาคร",
            "postalCode": "17170"
          },
          {
            "name": "ไร่พัฒนา",
            "postalCode": "17170"
          },
          {
            "name": "อู่ตะเภา",
            "postalCode": "17170"
          }
        ]
      },
      {
        "name": "วัดสิงห์",
        "subDistricts": [
          {
            "name": "วัดสิงห์",
            "postalCode": "17120"
          },
          {
            "name": "มะขามเฒ่า",
            "postalCode": "17120"
          },
          {
            "name": "หนองน้อย",
            "postalCode": "17120"
          },
          {
            "name": "หนองบัว",
            "postalCode": "17120"
          },
          {
            "name": "หนองขุ่น",
            "postalCode": "17120"
          },
          {
            "name": "บ่อแร่",
            "postalCode": "17120"
          },
          {
            "name": "วังหมัน",
            "postalCode": "17120"
          }
        ]
      },
      {
        "name": "สรรพยา",
        "subDistricts": [
          {
            "name": "สรรพยา",
            "postalCode": "17150"
          },
          {
            "name": "ตลุก",
            "postalCode": "17150"
          },
          {
            "name": "เขาแก้ว",
            "postalCode": "17150"
          },
          {
            "name": "โพนางดำตก",
            "postalCode": "17150"
          },
          {
            "name": "โพนางดำออก",
            "postalCode": "17150"
          },
          {
            "name": "บางหลวง",
            "postalCode": "17150"
          },
          {
            "name": "หาดอาษา",
            "postalCode": "17150"
          }
        ]
      },
      {
        "name": "สรรคบุรี",
        "subDistricts": [
          {
            "name": "แพรกศรีราชา",
            "postalCode": "17140"
          },
          {
            "name": "เที่ยงแท้",
            "postalCode": "17140"
          },
          {
            "name": "ห้วยกรด",
            "postalCode": "17140"
          },
          {
            "name": "โพงาม",
            "postalCode": "17140"
          },
          {
            "name": "บางขุด",
            "postalCode": "17140"
          },
          {
            "name": "ดงคอน",
            "postalCode": "17140"
          },
          {
            "name": "ดอนกำ",
            "postalCode": "17140"
          },
          {
            "name": "ห้วยกรดพัฒนา",
            "postalCode": "17140"
          }
        ]
      },
      {
        "name": "หันคา",
        "subDistricts": [
          {
            "name": "หันคา",
            "postalCode": "17130"
          },
          {
            "name": "บ้านเชี่ยน",
            "postalCode": "17130"
          },
          {
            "name": "ไพรนกยูง",
            "postalCode": "17130"
          },
          {
            "name": "หนองแซง",
            "postalCode": "17160"
          },
          {
            "name": "ห้วยงู",
            "postalCode": "17160"
          },
          {
            "name": "วังไก่เถื่อน",
            "postalCode": "17130"
          },
          {
            "name": "เด่นใหญ่",
            "postalCode": "17130"
          },
          {
            "name": "สามง่ามท่าโบสถ์",
            "postalCode": "17160"
          }
        ]
      },
      {
        "name": "หนองมะโมง",
        "subDistricts": [
          {
            "name": "หนองมะโมง",
            "postalCode": "17120"
          },
          {
            "name": "วังตะเคียน",
            "postalCode": "17120"
          },
          {
            "name": "สะพานหิน",
            "postalCode": "17120"
          },
          {
            "name": "กุดจอก",
            "postalCode": "17120"
          }
        ]
      },
      {
        "name": "เนินขาม",
        "subDistricts": [
          {
            "name": "เนินขาม",
            "postalCode": "17130"
          },
          {
            "name": "กะบกเตี้ย",
            "postalCode": "17130"
          },
          {
            "name": "สุขเดือนห้า",
            "postalCode": "17130"
          }
        ]
      }
    ]
  },
  {
    "name": "สระบุรี",
    "districts": [
      {
        "name": "เมืองสระบุรี",
        "subDistricts": [
          {
            "name": "ปากเพรียว",
            "postalCode": "18000"
          },
          {
            "name": "ดาวเรือง",
            "postalCode": "18000"
          },
          {
            "name": "นาโฉง",
            "postalCode": "18000"
          },
          {
            "name": "โคกสว่าง",
            "postalCode": "18000"
          },
          {
            "name": "หนองโน",
            "postalCode": "18000"
          },
          {
            "name": "หนองยาว",
            "postalCode": "18000"
          },
          {
            "name": "ปากข้าวสาร",
            "postalCode": "18000"
          },
          {
            "name": "หนองปลาไหล",
            "postalCode": "18000"
          },
          {
            "name": "กุดนกเปล้า",
            "postalCode": "18000"
          },
          {
            "name": "ตลิ่งชัน",
            "postalCode": "18000"
          },
          {
            "name": "ตะกุด",
            "postalCode": "18000"
          }
        ]
      },
      {
        "name": "แก่งคอย",
        "subDistricts": [
          {
            "name": "แก่งคอย",
            "postalCode": "18110"
          },
          {
            "name": "ทับกวาง",
            "postalCode": "18260"
          },
          {
            "name": "ตาลเดี่ยว",
            "postalCode": "18110"
          },
          {
            "name": "ห้วยแห้ง",
            "postalCode": "18110"
          },
          {
            "name": "ท่าคล้อ",
            "postalCode": "18110"
          },
          {
            "name": "หินซ้อน",
            "postalCode": "18110"
          },
          {
            "name": "บ้านธาตุ",
            "postalCode": "18110"
          },
          {
            "name": "บ้านป่า",
            "postalCode": "18110"
          },
          {
            "name": "ท่าตูม",
            "postalCode": "18110"
          },
          {
            "name": "ชะอม",
            "postalCode": "18110"
          },
          {
            "name": "สองคอน",
            "postalCode": "18110"
          },
          {
            "name": "เตาปูน",
            "postalCode": "18110"
          },
          {
            "name": "ชำผักแพว",
            "postalCode": "18110"
          },
          {
            "name": "ท่ามะปราง",
            "postalCode": "18110"
          }
        ]
      },
      {
        "name": "หนองแค",
        "subDistricts": [
          {
            "name": "หนองแค",
            "postalCode": "18140"
          },
          {
            "name": "กุ่มหัก",
            "postalCode": "18140"
          },
          {
            "name": "คชสิทธิ์",
            "postalCode": "18250"
          },
          {
            "name": "โคกตูม",
            "postalCode": "18250"
          },
          {
            "name": "โคกแย้",
            "postalCode": "18230"
          },
          {
            "name": "บัวลอย",
            "postalCode": "18230"
          },
          {
            "name": "ไผ่ต่ำ",
            "postalCode": "18140"
          },
          {
            "name": "โพนทอง",
            "postalCode": "18250"
          },
          {
            "name": "ห้วยขมิ้น",
            "postalCode": "18230"
          },
          {
            "name": "ห้วยทราย",
            "postalCode": "18230"
          },
          {
            "name": "หนองไข่น้ำ",
            "postalCode": "18140"
          },
          {
            "name": "หนองแขม",
            "postalCode": "18140"
          },
          {
            "name": "หนองจิก",
            "postalCode": "18230"
          },
          {
            "name": "หนองจรเข้",
            "postalCode": "18140"
          },
          {
            "name": "หนองนาก",
            "postalCode": "18230"
          },
          {
            "name": "หนองปลาหมอ",
            "postalCode": "18140"
          },
          {
            "name": "หนองปลิง",
            "postalCode": "18140"
          },
          {
            "name": "หนองโรง",
            "postalCode": "18140"
          }
        ]
      },
      {
        "name": "วิหารแดง",
        "subDistricts": [
          {
            "name": "หนองหมู",
            "postalCode": "18150"
          },
          {
            "name": "บ้านลำ",
            "postalCode": "18150"
          },
          {
            "name": "คลองเรือ",
            "postalCode": "18150"
          },
          {
            "name": "วิหารแดง",
            "postalCode": "18150"
          },
          {
            "name": "หนองสรวง",
            "postalCode": "18150"
          },
          {
            "name": "เจริญธรรม",
            "postalCode": "18150"
          }
        ]
      },
      {
        "name": "หนองแซง",
        "subDistricts": [
          {
            "name": "หนองแซง",
            "postalCode": "18170"
          },
          {
            "name": "หนองควายโซ",
            "postalCode": "18170"
          },
          {
            "name": "หนองหัวโพ",
            "postalCode": "18170"
          },
          {
            "name": "หนองสีดา",
            "postalCode": "18170"
          },
          {
            "name": "หนองกบ",
            "postalCode": "18170"
          },
          {
            "name": "ไก่เส่า",
            "postalCode": "18170"
          },
          {
            "name": "โคกสะอาด",
            "postalCode": "18170"
          },
          {
            "name": "ม่วงหวาน",
            "postalCode": "18170"
          },
          {
            "name": "เขาดิน",
            "postalCode": "18170"
          }
        ]
      },
      {
        "name": "บ้านหมอ",
        "subDistricts": [
          {
            "name": "บ้านหมอ",
            "postalCode": "18130"
          },
          {
            "name": "บางโขมด",
            "postalCode": "18130"
          },
          {
            "name": "สร่างโศก",
            "postalCode": "18130"
          },
          {
            "name": "ตลาดน้อย",
            "postalCode": "18130"
          },
          {
            "name": "หรเทพ",
            "postalCode": "18130"
          },
          {
            "name": "โคกใหญ่",
            "postalCode": "18130"
          },
          {
            "name": "ไผ่ขวาง",
            "postalCode": "18130"
          },
          {
            "name": "บ้านครัว",
            "postalCode": "18270"
          },
          {
            "name": "หนองบัว",
            "postalCode": "18130"
          }
        ]
      },
      {
        "name": "ดอนพุด",
        "subDistricts": [
          {
            "name": "ดอนพุด",
            "postalCode": "18210"
          },
          {
            "name": "ไผ่หลิ่ว",
            "postalCode": "18210"
          },
          {
            "name": "บ้านหลวง",
            "postalCode": "18210"
          },
          {
            "name": "ดงตะงาว",
            "postalCode": "18210"
          }
        ]
      },
      {
        "name": "หนองโดน",
        "subDistricts": [
          {
            "name": "หนองโดน",
            "postalCode": "18190"
          },
          {
            "name": "บ้านกลับ",
            "postalCode": "18190"
          },
          {
            "name": "ดอนทอง",
            "postalCode": "18190"
          },
          {
            "name": "บ้านโปร่ง",
            "postalCode": "18190"
          }
        ]
      },
      {
        "name": "พระพุทธบาท",
        "subDistricts": [
          {
            "name": "พระพุทธบาท",
            "postalCode": "18120"
          },
          {
            "name": "ขุนโขลน",
            "postalCode": "18120"
          },
          {
            "name": "ธารเกษม",
            "postalCode": "18120"
          },
          {
            "name": "นายาว",
            "postalCode": "18120"
          },
          {
            "name": "พุคำจาน",
            "postalCode": "18120"
          },
          {
            "name": "เขาวง",
            "postalCode": "18120"
          },
          {
            "name": "ห้วยป่าหวาย",
            "postalCode": "18120"
          },
          {
            "name": "พุกร่าง",
            "postalCode": "18120"
          },
          {
            "name": "หนองแก",
            "postalCode": "18120"
          }
        ]
      },
      {
        "name": "เสาไห้",
        "subDistricts": [
          {
            "name": "เสาไห้",
            "postalCode": "18160"
          },
          {
            "name": "บ้านยาง",
            "postalCode": "18160"
          },
          {
            "name": "หัวปลวก",
            "postalCode": "18160"
          },
          {
            "name": "งิ้วงาม",
            "postalCode": "18160"
          },
          {
            "name": "ศาลารีไทย",
            "postalCode": "18160"
          },
          {
            "name": "ต้นตาล",
            "postalCode": "18160"
          },
          {
            "name": "ท่าช้าง",
            "postalCode": "18160"
          },
          {
            "name": "พระยาทด",
            "postalCode": "18160"
          },
          {
            "name": "ม่วงงาม",
            "postalCode": "18160"
          },
          {
            "name": "เริงราง",
            "postalCode": "18160"
          },
          {
            "name": "เมืองเก่า",
            "postalCode": "18160"
          },
          {
            "name": "สวนดอกไม้",
            "postalCode": "18160"
          }
        ]
      },
      {
        "name": "มวกเหล็ก",
        "subDistricts": [
          {
            "name": "มวกเหล็ก",
            "postalCode": "18180"
          },
          {
            "name": "มิตรภาพ",
            "postalCode": "18180"
          },
          {
            "name": "หนองย่างเสือ",
            "postalCode": "18180"
          },
          {
            "name": "ลำสมพุง",
            "postalCode": "18180"
          },
          {
            "name": "ลำพญากลาง",
            "postalCode": "18180"
          },
          {
            "name": "ซับสนุ่น",
            "postalCode": "18220"
          }
        ]
      },
      {
        "name": "วังม่วง",
        "subDistricts": [
          {
            "name": "แสลงพัน",
            "postalCode": "18220"
          },
          {
            "name": "คำพราน",
            "postalCode": "18220"
          },
          {
            "name": "วังม่วง",
            "postalCode": "18220"
          }
        ]
      },
      {
        "name": "เฉลิมพระเกียรติ",
        "subDistricts": [
          {
            "name": "เขาดินพัฒนา",
            "postalCode": "18000"
          },
          {
            "name": "บ้านแก้ง",
            "postalCode": "18000"
          },
          {
            "name": "ผึ้งรวง",
            "postalCode": "18000"
          },
          {
            "name": "พุแค",
            "postalCode": "18240"
          },
          {
            "name": "ห้วยบง",
            "postalCode": "18000"
          },
          {
            "name": "หน้าพระลาน",
            "postalCode": "18240"
          }
        ]
      }
    ]
  },
  {
    "name": "ชลบุรี",
    "districts": [
      {
        "name": "เมืองชลบุรี",
        "subDistricts": [
          {
            "name": "บางปลาสร้อย",
            "postalCode": "20000"
          },
          {
            "name": "มะขามหย่ง",
            "postalCode": "20000"
          },
          {
            "name": "บ้านโขด",
            "postalCode": "20000"
          },
          {
            "name": "แสนสุข",
            "postalCode": "20000"
          },
          {
            "name": "บ้านสวน",
            "postalCode": "20000"
          },
          {
            "name": "หนองรี",
            "postalCode": "20000"
          },
          {
            "name": "นาป่า",
            "postalCode": "20000"
          },
          {
            "name": "หนองข้างคอก",
            "postalCode": "20000"
          },
          {
            "name": "ดอนหัวฬ่อ",
            "postalCode": "20000"
          },
          {
            "name": "หนองไม้แดง",
            "postalCode": "20000"
          },
          {
            "name": "บางทราย",
            "postalCode": "20000"
          },
          {
            "name": "คลองตำหรุ",
            "postalCode": "20000"
          },
          {
            "name": "เหมือง",
            "postalCode": "20130"
          },
          {
            "name": "บ้านปึก",
            "postalCode": "20130"
          },
          {
            "name": "ห้วยกะปิ",
            "postalCode": "20000"
          },
          {
            "name": "เสม็ด",
            "postalCode": "20130"
          },
          {
            "name": "อ่างศิลา",
            "postalCode": "20000"
          },
          {
            "name": "สำนักบก",
            "postalCode": "20000"
          }
        ]
      },
      {
        "name": "บ้านบึง",
        "subDistricts": [
          {
            "name": "บ้านบึง",
            "postalCode": "20170"
          },
          {
            "name": "คลองกิ่ว",
            "postalCode": "20220"
          },
          {
            "name": "มาบไผ่",
            "postalCode": "20170"
          },
          {
            "name": "หนองซ้ำซาก",
            "postalCode": "20170"
          },
          {
            "name": "หนองบอนแดง",
            "postalCode": "20170"
          },
          {
            "name": "หนองชาก",
            "postalCode": "20170"
          },
          {
            "name": "หนองอิรุณ",
            "postalCode": "20220"
          },
          {
            "name": "หนองไผ่แก้ว",
            "postalCode": "20220"
          }
        ]
      },
      {
        "name": "หนองใหญ่",
        "subDistricts": [
          {
            "name": "หนองใหญ่",
            "postalCode": "20190"
          },
          {
            "name": "คลองพลู",
            "postalCode": "20190"
          },
          {
            "name": "หนองเสือช้าง",
            "postalCode": "20190"
          },
          {
            "name": "ห้างสูง",
            "postalCode": "20190"
          },
          {
            "name": "เขาซก",
            "postalCode": "20190"
          }
        ]
      },
      {
        "name": "บางละมุง",
        "subDistricts": [
          {
            "name": "บางละมุง",
            "postalCode": "20150"
          },
          {
            "name": "หนองปรือ",
            "postalCode": "20150"
          },
          {
            "name": "หนองปลาไหล",
            "postalCode": "20150"
          },
          {
            "name": "โป่ง",
            "postalCode": "20150"
          },
          {
            "name": "เขาไม้แก้ว",
            "postalCode": "20150"
          },
          {
            "name": "ห้วยใหญ่",
            "postalCode": "20150"
          },
          {
            "name": "ตะเคียนเตี้ย",
            "postalCode": "20150"
          },
          {
            "name": "นาเกลือ",
            "postalCode": "20150"
          }
        ]
      },
      {
        "name": "พานทอง",
        "subDistricts": [
          {
            "name": "พานทอง",
            "postalCode": "20160"
          },
          {
            "name": "หนองตำลึง",
            "postalCode": "20160"
          },
          {
            "name": "มาบโป่ง",
            "postalCode": "20160"
          },
          {
            "name": "หนองกะขะ",
            "postalCode": "20160"
          },
          {
            "name": "หนองหงษ์",
            "postalCode": "20160"
          },
          {
            "name": "โคกขี้หนอน",
            "postalCode": "20160"
          },
          {
            "name": "บ้านเก่า",
            "postalCode": "20160"
          },
          {
            "name": "หน้าประดู่",
            "postalCode": "20160"
          },
          {
            "name": "บางนาง",
            "postalCode": "20160"
          },
          {
            "name": "เกาะลอย",
            "postalCode": "20160"
          },
          {
            "name": "บางหัก",
            "postalCode": "20160"
          }
        ]
      },
      {
        "name": "พนัสนิคม",
        "subDistricts": [
          {
            "name": "พนัสนิคม",
            "postalCode": "20140"
          },
          {
            "name": "หน้าพระธาตุ",
            "postalCode": "20140"
          },
          {
            "name": "วัดหลวง",
            "postalCode": "20140"
          },
          {
            "name": "บ้านเซิด",
            "postalCode": "20140"
          },
          {
            "name": "นาเริก",
            "postalCode": "20140"
          },
          {
            "name": "หมอนนาง",
            "postalCode": "20140"
          },
          {
            "name": "สระสี่เหลี่ยม",
            "postalCode": "20140"
          },
          {
            "name": "วัดโบสถ์",
            "postalCode": "20140"
          },
          {
            "name": "กุฎโง้ง",
            "postalCode": "20140"
          },
          {
            "name": "หัวถนน",
            "postalCode": "20140"
          },
          {
            "name": "ท่าข้าม",
            "postalCode": "20140"
          },
          {
            "name": "หนองปรือ",
            "postalCode": "20140"
          },
          {
            "name": "หนองขยาด",
            "postalCode": "20140"
          },
          {
            "name": "ทุ่งขวาง",
            "postalCode": "20140"
          },
          {
            "name": "หนองเหียง",
            "postalCode": "20140"
          },
          {
            "name": "นาวังหิน",
            "postalCode": "20140"
          },
          {
            "name": "บ้านช้าง",
            "postalCode": "20140"
          },
          {
            "name": "โคกเพลาะ",
            "postalCode": "20140"
          },
          {
            "name": "ไร่หลักทอง",
            "postalCode": "20140"
          },
          {
            "name": "นามะตูม",
            "postalCode": "20140"
          }
        ]
      },
      {
        "name": "ศรีราชา",
        "subDistricts": [
          {
            "name": "ศรีราชา",
            "postalCode": "20110"
          },
          {
            "name": "สุรศักดิ์",
            "postalCode": "20110"
          },
          {
            "name": "ทุ่งสุขลา",
            "postalCode": "20230"
          },
          {
            "name": "บึง",
            "postalCode": "20230"
          },
          {
            "name": "หนองขาม",
            "postalCode": "20110"
          },
          {
            "name": "เขาคันทรง",
            "postalCode": "20110"
          },
          {
            "name": "บางพระ",
            "postalCode": "20110"
          },
          {
            "name": "บ่อวิน",
            "postalCode": "20230"
          }
        ]
      },
      {
        "name": "เกาะสีชัง",
        "subDistricts": [
          {
            "name": "ท่าเทววงษ์",
            "postalCode": "20120"
          }
        ]
      },
      {
        "name": "สัตหีบ",
        "subDistricts": [
          {
            "name": "สัตหีบ",
            "postalCode": "20180"
          },
          {
            "name": "นาจอมเทียน",
            "postalCode": "20250"
          },
          {
            "name": "พลูตาหลวง",
            "postalCode": "20180"
          },
          {
            "name": "บางเสร่",
            "postalCode": "20250"
          },
          {
            "name": "แสมสาร",
            "postalCode": "20180"
          }
        ]
      },
      {
        "name": "บ่อทอง",
        "subDistricts": [
          {
            "name": "บ่อทอง",
            "postalCode": "20270"
          },
          {
            "name": "วัดสุวรรณ",
            "postalCode": "20270"
          },
          {
            "name": "บ่อกวางทอง",
            "postalCode": "20270"
          },
          {
            "name": "ธาตุทอง",
            "postalCode": "20270"
          },
          {
            "name": "เกษตรสุวรรณ",
            "postalCode": "20270"
          },
          {
            "name": "พลวงทอง",
            "postalCode": "20270"
          }
        ]
      },
      {
        "name": "เกาะจันทร์",
        "subDistricts": [
          {
            "name": "เกาะจันทร์",
            "postalCode": "20240"
          },
          {
            "name": "ท่าบุญมี",
            "postalCode": "20240"
          }
        ]
      }
    ]
  },
  {
    "name": "ระยอง",
    "districts": [
      {
        "name": "เมืองระยอง",
        "subDistricts": [
          {
            "name": "ท่าประดู่",
            "postalCode": "21000"
          },
          {
            "name": "เชิงเนิน",
            "postalCode": "21000"
          },
          {
            "name": "ตะพง",
            "postalCode": "21000"
          },
          {
            "name": "ปากน้ำ",
            "postalCode": "21000"
          },
          {
            "name": "เพ",
            "postalCode": "21160"
          },
          {
            "name": "แกลง",
            "postalCode": "21160"
          },
          {
            "name": "บ้านแลง",
            "postalCode": "21000"
          },
          {
            "name": "นาตาขวัญ",
            "postalCode": "21000"
          },
          {
            "name": "เนินพระ",
            "postalCode": "21000"
          },
          {
            "name": "กะเฉด",
            "postalCode": "21100"
          },
          {
            "name": "ทับมา",
            "postalCode": "21000"
          },
          {
            "name": "น้ำคอก",
            "postalCode": "21000"
          },
          {
            "name": "ห้วยโป่ง",
            "postalCode": "21150"
          },
          {
            "name": "มาบตาพุด",
            "postalCode": "21150"
          },
          {
            "name": "สำนักทอง",
            "postalCode": "21100"
          }
        ]
      },
      {
        "name": "บ้านฉาง",
        "subDistricts": [
          {
            "name": "สำนักท้อน",
            "postalCode": "21130"
          },
          {
            "name": "พลา",
            "postalCode": "21130"
          },
          {
            "name": "บ้านฉาง",
            "postalCode": "21130"
          }
        ]
      },
      {
        "name": "แกลง",
        "subDistricts": [
          {
            "name": "ทางเกวียน",
            "postalCode": "21110"
          },
          {
            "name": "วังหว้า",
            "postalCode": "21110"
          },
          {
            "name": "ชากโดน",
            "postalCode": "21110"
          },
          {
            "name": "เนินฆ้อ",
            "postalCode": "21110"
          },
          {
            "name": "กร่ำ",
            "postalCode": "21190"
          },
          {
            "name": "ชากพง",
            "postalCode": "21190"
          },
          {
            "name": "กระแสบน",
            "postalCode": "21110"
          },
          {
            "name": "บ้านนา",
            "postalCode": "21110"
          },
          {
            "name": "ทุ่งควายกิน",
            "postalCode": "21110"
          },
          {
            "name": "กองดิน",
            "postalCode": "22160"
          },
          {
            "name": "คลองปูน",
            "postalCode": "21170"
          },
          {
            "name": "พังราด",
            "postalCode": "21110"
          },
          {
            "name": "ปากน้ำกระแส",
            "postalCode": "21170"
          },
          {
            "name": "ห้วยยาง",
            "postalCode": "21110"
          },
          {
            "name": "สองสลึง",
            "postalCode": "21110"
          }
        ]
      },
      {
        "name": "วังจันทร์",
        "subDistricts": [
          {
            "name": "วังจันทร์",
            "postalCode": "21210"
          },
          {
            "name": "ชุมแสง",
            "postalCode": "21210"
          },
          {
            "name": "ป่ายุบใน",
            "postalCode": "21210"
          },
          {
            "name": "พลงตาเอี่ยม",
            "postalCode": "21210"
          }
        ]
      },
      {
        "name": "บ้านค่าย",
        "subDistricts": [
          {
            "name": "บ้านค่าย",
            "postalCode": "21120"
          },
          {
            "name": "หนองละลอก",
            "postalCode": "21120"
          },
          {
            "name": "หนองตะพาน",
            "postalCode": "21120"
          },
          {
            "name": "ตาขัน",
            "postalCode": "21120"
          },
          {
            "name": "บางบุตร",
            "postalCode": "21120"
          },
          {
            "name": "หนองบัว",
            "postalCode": "21120"
          },
          {
            "name": "ชากบก",
            "postalCode": "21120"
          }
        ]
      },
      {
        "name": "ปลวกแดง",
        "subDistricts": [
          {
            "name": "ปลวกแดง",
            "postalCode": "21140"
          },
          {
            "name": "ตาสิทธิ์",
            "postalCode": "21140"
          },
          {
            "name": "ละหาร",
            "postalCode": "21140"
          },
          {
            "name": "แม่น้ำคู้",
            "postalCode": "21140"
          },
          {
            "name": "มาบยางพร",
            "postalCode": "21140"
          },
          {
            "name": "หนองไร่",
            "postalCode": "21140"
          }
        ]
      },
      {
        "name": "เขาชะเมา",
        "subDistricts": [
          {
            "name": "น้ำเป็น",
            "postalCode": "21110"
          },
          {
            "name": "ห้วยทับมอญ",
            "postalCode": "21110"
          },
          {
            "name": "ชำฆ้อ",
            "postalCode": "21110"
          },
          {
            "name": "เขาน้อย",
            "postalCode": "21110"
          }
        ]
      },
      {
        "name": "นิคมพัฒนา",
        "subDistricts": [
          {
            "name": "นิคมพัฒนา",
            "postalCode": "21180"
          },
          {
            "name": "มาบข่า",
            "postalCode": "21180"
          },
          {
            "name": "พนานิคม",
            "postalCode": "21180"
          },
          {
            "name": "มะขามคู่",
            "postalCode": "21180"
          }
        ]
      }
    ]
  },
  {
    "name": "จันทบุรี",
    "districts": [
      {
        "name": "เมืองจันทบุรี",
        "subDistricts": [
          {
            "name": "ตลาด",
            "postalCode": "22000"
          },
          {
            "name": "วัดใหม่",
            "postalCode": "22000"
          },
          {
            "name": "คลองนารายณ์",
            "postalCode": "22000"
          },
          {
            "name": "เกาะขวาง",
            "postalCode": "22000"
          },
          {
            "name": "คมบาง",
            "postalCode": "22000"
          },
          {
            "name": "ท่าช้าง",
            "postalCode": "22000"
          },
          {
            "name": "จันทนิมิต",
            "postalCode": "22000"
          },
          {
            "name": "บางกะจะ",
            "postalCode": "22000"
          },
          {
            "name": "แสลง",
            "postalCode": "22000"
          },
          {
            "name": "หนองบัว",
            "postalCode": "22000"
          },
          {
            "name": "พลับพลา",
            "postalCode": "22000"
          }
        ]
      },
      {
        "name": "ขลุง",
        "subDistricts": [
          {
            "name": "ขลุง",
            "postalCode": "22110"
          },
          {
            "name": "บ่อ",
            "postalCode": "22110"
          },
          {
            "name": "เกวียนหัก",
            "postalCode": "22110"
          },
          {
            "name": "ตะปอน",
            "postalCode": "22110"
          },
          {
            "name": "บางชัน",
            "postalCode": "22110"
          },
          {
            "name": "วันยาว",
            "postalCode": "22110"
          },
          {
            "name": "ซึ้ง",
            "postalCode": "22110"
          },
          {
            "name": "มาบไพ",
            "postalCode": "22110"
          },
          {
            "name": "วังสรรพรส",
            "postalCode": "22110"
          },
          {
            "name": "ตรอกนอง",
            "postalCode": "22110"
          },
          {
            "name": "ตกพรม",
            "postalCode": "22110"
          },
          {
            "name": "บ่อเวฬุ",
            "postalCode": "22150"
          }
        ]
      },
      {
        "name": "ท่าใหม่",
        "subDistricts": [
          {
            "name": "ท่าใหม่",
            "postalCode": "22120"
          },
          {
            "name": "ยายร้า",
            "postalCode": "22120"
          },
          {
            "name": "สีพยา",
            "postalCode": "22120"
          },
          {
            "name": "บ่อพุ",
            "postalCode": "22120"
          },
          {
            "name": "พลอยแหวน",
            "postalCode": "22120"
          },
          {
            "name": "เขาวัว",
            "postalCode": "22120"
          },
          {
            "name": "เขาบายศรี",
            "postalCode": "22120"
          },
          {
            "name": "สองพี่น้อง",
            "postalCode": "22120"
          },
          {
            "name": "ทุ่งเบญจา",
            "postalCode": "22170"
          },
          {
            "name": "รำพัน",
            "postalCode": "22170"
          },
          {
            "name": "โขมง",
            "postalCode": "22170"
          },
          {
            "name": "ตะกาดเง้า",
            "postalCode": "22120"
          },
          {
            "name": "คลองขุด",
            "postalCode": "22120"
          },
          {
            "name": "เขาแก้ว",
            "postalCode": "22170"
          }
        ]
      },
      {
        "name": "โป่งน้ำร้อน",
        "subDistricts": [
          {
            "name": "ทับไทร",
            "postalCode": "22140"
          },
          {
            "name": "โป่งน้ำร้อน",
            "postalCode": "22140"
          },
          {
            "name": "หนองตาคง",
            "postalCode": "22140"
          },
          {
            "name": "เทพนิมิต",
            "postalCode": "22140"
          },
          {
            "name": "คลองใหญ่",
            "postalCode": "22140"
          }
        ]
      },
      {
        "name": "มะขาม",
        "subDistricts": [
          {
            "name": "มะขาม",
            "postalCode": "22150"
          },
          {
            "name": "ท่าหลวง",
            "postalCode": "22150"
          },
          {
            "name": "ปัถวี",
            "postalCode": "22150"
          },
          {
            "name": "วังแซ้ม",
            "postalCode": "22150"
          },
          {
            "name": "ฉมัน",
            "postalCode": "22150"
          },
          {
            "name": "อ่างคีรี",
            "postalCode": "22150"
          }
        ]
      },
      {
        "name": "แหลมสิงห์",
        "subDistricts": [
          {
            "name": "ปากน้ำแหลมสิงห์",
            "postalCode": "22130"
          },
          {
            "name": "เกาะเปริด",
            "postalCode": "22130"
          },
          {
            "name": "หนองชิ่ม",
            "postalCode": "22130"
          },
          {
            "name": "พลิ้ว",
            "postalCode": "22190"
          },
          {
            "name": "คลองน้ำเค็ม",
            "postalCode": "22190"
          },
          {
            "name": "บางสระเก้า",
            "postalCode": "22190"
          },
          {
            "name": "บางกะไชย",
            "postalCode": "22120"
          }
        ]
      },
      {
        "name": "สอยดาว",
        "subDistricts": [
          {
            "name": "ปะตง",
            "postalCode": "22180"
          },
          {
            "name": "ทุ่งขนาน",
            "postalCode": "22180"
          },
          {
            "name": "ทับช้าง",
            "postalCode": "22180"
          },
          {
            "name": "ทรายขาว",
            "postalCode": "22180"
          },
          {
            "name": "สะตอน",
            "postalCode": "22180"
          }
        ]
      },
      {
        "name": "แก่งหางแมว",
        "subDistricts": [
          {
            "name": "แก่งหางแมว",
            "postalCode": "22160"
          },
          {
            "name": "ขุนซ่อง",
            "postalCode": "22160"
          },
          {
            "name": "สามพี่น้อง",
            "postalCode": "22160"
          },
          {
            "name": "พวา",
            "postalCode": "22160"
          },
          {
            "name": "เขาวงกต",
            "postalCode": "22160"
          }
        ]
      },
      {
        "name": "นายายอาม",
        "subDistricts": [
          {
            "name": "นายายอาม",
            "postalCode": "22160"
          },
          {
            "name": "วังโตนด",
            "postalCode": "22170"
          },
          {
            "name": "กระแจะ",
            "postalCode": "22170"
          },
          {
            "name": "สนามไชย",
            "postalCode": "22170"
          },
          {
            "name": "ช้างข้าม",
            "postalCode": "22160"
          },
          {
            "name": "วังใหม่",
            "postalCode": "22170"
          }
        ]
      },
      {
        "name": "เขาคิชฌกูฏ",
        "subDistricts": [
          {
            "name": "ชากไทย",
            "postalCode": "22210"
          },
          {
            "name": "พลวง",
            "postalCode": "22210"
          },
          {
            "name": "ตะเคียนทอง",
            "postalCode": "22210"
          },
          {
            "name": "คลองพลู",
            "postalCode": "22210"
          },
          {
            "name": "จันทเขลม",
            "postalCode": "22210"
          }
        ]
      }
    ]
  },
  {
    "name": "ตราด",
    "districts": [
      {
        "name": "เมืองตราด",
        "subDistricts": [
          {
            "name": "บางพระ",
            "postalCode": "23000"
          },
          {
            "name": "หนองเสม็ด",
            "postalCode": "23000"
          },
          {
            "name": "หนองโสน",
            "postalCode": "23000"
          },
          {
            "name": "หนองคันทรง",
            "postalCode": "23000"
          },
          {
            "name": "ห้วงน้ำขาว",
            "postalCode": "23000"
          },
          {
            "name": "อ่าวใหญ่",
            "postalCode": "23000"
          },
          {
            "name": "วังกระแจะ",
            "postalCode": "23000"
          },
          {
            "name": "ห้วยแร้ง",
            "postalCode": "23000"
          },
          {
            "name": "เนินทราย",
            "postalCode": "23000"
          },
          {
            "name": "ท่าพริก",
            "postalCode": "23000"
          },
          {
            "name": "ท่ากุ่ม",
            "postalCode": "23000"
          },
          {
            "name": "ตะกาง",
            "postalCode": "23000"
          },
          {
            "name": "ชำราก",
            "postalCode": "23000"
          },
          {
            "name": "แหลมกลัด",
            "postalCode": "23000"
          }
        ]
      },
      {
        "name": "คลองใหญ่",
        "subDistricts": [
          {
            "name": "คลองใหญ่",
            "postalCode": "23110"
          },
          {
            "name": "ไม้รูด",
            "postalCode": "23110"
          },
          {
            "name": "หาดเล็ก",
            "postalCode": "23110"
          }
        ]
      },
      {
        "name": "เขาสมิง",
        "subDistricts": [
          {
            "name": "เขาสมิง",
            "postalCode": "23130"
          },
          {
            "name": "แสนตุ้ง",
            "postalCode": "23150"
          },
          {
            "name": "วังตะเคียน",
            "postalCode": "23130"
          },
          {
            "name": "ท่าโสม",
            "postalCode": "23150"
          },
          {
            "name": "สะตอ",
            "postalCode": "23150"
          },
          {
            "name": "ประณีต",
            "postalCode": "23150"
          },
          {
            "name": "เทพนิมิต",
            "postalCode": "23150"
          },
          {
            "name": "ทุ่งนนทรี",
            "postalCode": "23130"
          }
        ]
      },
      {
        "name": "บ่อไร่",
        "subDistricts": [
          {
            "name": "บ่อพลอย",
            "postalCode": "23140"
          },
          {
            "name": "ช้างทูน",
            "postalCode": "23140"
          },
          {
            "name": "ด่านชุมพล",
            "postalCode": "23140"
          },
          {
            "name": "หนองบอน",
            "postalCode": "23140"
          },
          {
            "name": "นนทรีย์",
            "postalCode": "23140"
          }
        ]
      },
      {
        "name": "แหลมงอบ",
        "subDistricts": [
          {
            "name": "แหลมงอบ",
            "postalCode": "23120"
          },
          {
            "name": "น้ำเชี่ยว",
            "postalCode": "23120"
          },
          {
            "name": "บางปิด",
            "postalCode": "23120"
          },
          {
            "name": "คลองใหญ่",
            "postalCode": "23120"
          }
        ]
      },
      {
        "name": "เกาะกูด",
        "subDistricts": [
          {
            "name": "เกาะหมาก",
            "postalCode": "23000"
          },
          {
            "name": "เกาะกูด",
            "postalCode": "23000"
          }
        ]
      },
      {
        "name": "เกาะช้าง",
        "subDistricts": [
          {
            "name": "เกาะช้าง",
            "postalCode": "23170"
          },
          {
            "name": "เกาะช้างใต้",
            "postalCode": "23170"
          }
        ]
      }
    ]
  },
  {
    "name": "ฉะเชิงเทรา",
    "districts": [
      {
        "name": "เมืองฉะเชิงเทรา",
        "subDistricts": [
          {
            "name": "หน้าเมือง",
            "postalCode": "24000"
          },
          {
            "name": "ท่าไข่",
            "postalCode": "24000"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "24000"
          },
          {
            "name": "คลองนา",
            "postalCode": "24000"
          },
          {
            "name": "บางตีนเป็ด",
            "postalCode": "24000"
          },
          {
            "name": "บางไผ่",
            "postalCode": "24000"
          },
          {
            "name": "คลองจุกกระเฌอ",
            "postalCode": "24000"
          },
          {
            "name": "บางแก้ว",
            "postalCode": "24000"
          },
          {
            "name": "บางขวัญ",
            "postalCode": "24000"
          },
          {
            "name": "คลองนครเนื่องเขต",
            "postalCode": "24000"
          },
          {
            "name": "วังตะเคียน",
            "postalCode": "24000"
          },
          {
            "name": "โสธร",
            "postalCode": "24000"
          },
          {
            "name": "บางพระ",
            "postalCode": "24000"
          },
          {
            "name": "บางกะไห",
            "postalCode": "24000"
          },
          {
            "name": "หนามแดง",
            "postalCode": "24000"
          },
          {
            "name": "คลองเปรง",
            "postalCode": "24000"
          },
          {
            "name": "คลองอุดมชลจร",
            "postalCode": "24000"
          },
          {
            "name": "คลองหลวงแพ่ง",
            "postalCode": "24000"
          },
          {
            "name": "บางเตย",
            "postalCode": "24000"
          }
        ]
      },
      {
        "name": "บางคล้า",
        "subDistricts": [
          {
            "name": "บางคล้า",
            "postalCode": "24110"
          },
          {
            "name": "บางสวน",
            "postalCode": "24110"
          },
          {
            "name": "บางกระเจ็ด",
            "postalCode": "24110"
          },
          {
            "name": "ปากน้ำ",
            "postalCode": "24110"
          },
          {
            "name": "ท่าทองหลาง",
            "postalCode": "24110"
          },
          {
            "name": "สาวชะโงก",
            "postalCode": "24110"
          },
          {
            "name": "เสม็ดเหนือ",
            "postalCode": "24110"
          },
          {
            "name": "เสม็ดใต้",
            "postalCode": "24110"
          },
          {
            "name": "หัวไทร",
            "postalCode": "24110"
          }
        ]
      },
      {
        "name": "บางน้ำเปรี้ยว",
        "subDistricts": [
          {
            "name": "บางน้ำเปรี้ยว",
            "postalCode": "24150"
          },
          {
            "name": "บางขนาก",
            "postalCode": "24150"
          },
          {
            "name": "สิงโตทอง",
            "postalCode": "24150"
          },
          {
            "name": "หมอนทอง",
            "postalCode": "24150"
          },
          {
            "name": "บึงน้ำรักษ์",
            "postalCode": "24170"
          },
          {
            "name": "ดอนเกาะกา",
            "postalCode": "24170"
          },
          {
            "name": "โยธะกา",
            "postalCode": "24150"
          },
          {
            "name": "ดอนฉิมพลี",
            "postalCode": "24170"
          },
          {
            "name": "ศาลาแดง",
            "postalCode": "24000"
          },
          {
            "name": "โพรงอากาศ",
            "postalCode": "24150"
          }
        ]
      },
      {
        "name": "บางปะกง",
        "subDistricts": [
          {
            "name": "บางปะกง",
            "postalCode": "24130"
          },
          {
            "name": "ท่าสะอ้าน",
            "postalCode": "24130"
          },
          {
            "name": "บางวัว",
            "postalCode": "24180"
          },
          {
            "name": "บางสมัคร",
            "postalCode": "24180"
          },
          {
            "name": "บางผึ้ง",
            "postalCode": "24130"
          },
          {
            "name": "บางเกลือ",
            "postalCode": "24180"
          },
          {
            "name": "สองคลอง",
            "postalCode": "24130"
          },
          {
            "name": "หนองจอก",
            "postalCode": "24130"
          },
          {
            "name": "พิมพา",
            "postalCode": "24130"
          },
          {
            "name": "ท่าข้าม",
            "postalCode": "24130"
          },
          {
            "name": "หอมศีล",
            "postalCode": "24180"
          },
          {
            "name": "เขาดิน",
            "postalCode": "24130"
          }
        ]
      },
      {
        "name": "บ้านโพธิ์",
        "subDistricts": [
          {
            "name": "บ้านโพธิ์",
            "postalCode": "24140"
          },
          {
            "name": "เกาะไร่",
            "postalCode": "24140"
          },
          {
            "name": "คลองขุด",
            "postalCode": "24140"
          },
          {
            "name": "คลองบ้านโพธิ์",
            "postalCode": "24140"
          },
          {
            "name": "คลองประเวศ",
            "postalCode": "24140"
          },
          {
            "name": "ดอนทราย",
            "postalCode": "24140"
          },
          {
            "name": "เทพราช",
            "postalCode": "24140"
          },
          {
            "name": "ท่าพลับ",
            "postalCode": "24140"
          },
          {
            "name": "หนองตีนนก",
            "postalCode": "24140"
          },
          {
            "name": "หนองบัว",
            "postalCode": "24140"
          },
          {
            "name": "บางซ่อน",
            "postalCode": "24140"
          },
          {
            "name": "บางกรูด",
            "postalCode": "24140"
          },
          {
            "name": "แหลมประดู่",
            "postalCode": "24140"
          },
          {
            "name": "ลาดขวาง",
            "postalCode": "24140"
          },
          {
            "name": "สนามจันทร์",
            "postalCode": "24140"
          },
          {
            "name": "แสนภูดาษ",
            "postalCode": "24140"
          },
          {
            "name": "สิบเอ็ดศอก",
            "postalCode": "24140"
          }
        ]
      },
      {
        "name": "พนมสารคาม",
        "subDistricts": [
          {
            "name": "เกาะขนุน",
            "postalCode": "24120"
          },
          {
            "name": "บ้านซ่อง",
            "postalCode": "24120"
          },
          {
            "name": "พนมสารคาม",
            "postalCode": "24120"
          },
          {
            "name": "เมืองเก่า",
            "postalCode": "24120"
          },
          {
            "name": "หนองยาว",
            "postalCode": "24120"
          },
          {
            "name": "ท่าถ่าน",
            "postalCode": "24120"
          },
          {
            "name": "หนองแหน",
            "postalCode": "24120"
          },
          {
            "name": "เขาหินซ้อน",
            "postalCode": "24120"
          }
        ]
      },
      {
        "name": "ราชสาส์น",
        "subDistricts": [
          {
            "name": "บางคา",
            "postalCode": "24120"
          },
          {
            "name": "เมืองใหม่",
            "postalCode": "24120"
          },
          {
            "name": "ดงน้อย",
            "postalCode": "24120"
          }
        ]
      },
      {
        "name": "สนามชัยเขต",
        "subDistricts": [
          {
            "name": "คู้ยายหมี",
            "postalCode": "24160"
          },
          {
            "name": "ท่ากระดาน",
            "postalCode": "24160"
          },
          {
            "name": "ทุ่งพระยา",
            "postalCode": "24160"
          },
          {
            "name": "ลาดกระทิง",
            "postalCode": "24160"
          }
        ]
      },
      {
        "name": "แปลงยาว",
        "subDistricts": [
          {
            "name": "แปลงยาว",
            "postalCode": "24190"
          },
          {
            "name": "วังเย็น",
            "postalCode": "24190"
          },
          {
            "name": "หัวสำโรง",
            "postalCode": "24190"
          },
          {
            "name": "หนองไม้แก่น",
            "postalCode": "24190"
          }
        ]
      },
      {
        "name": "ท่าตะเกียบ",
        "subDistricts": [
          {
            "name": "ท่าตะเกียบ",
            "postalCode": "24160"
          },
          {
            "name": "คลองตะเกรา",
            "postalCode": "24160"
          }
        ]
      },
      {
        "name": "คลองเขื่อน",
        "subDistricts": [
          {
            "name": "ก้อนแก้ว",
            "postalCode": "24000"
          },
          {
            "name": "คลองเขื่อน",
            "postalCode": "24000"
          },
          {
            "name": "บางเล่า",
            "postalCode": "24000"
          },
          {
            "name": "บางโรง",
            "postalCode": "24000"
          },
          {
            "name": "บางตลาด",
            "postalCode": "24110"
          }
        ]
      }
    ]
  },
  {
    "name": "ปราจีนบุรี",
    "districts": [
      {
        "name": "เมืองปราจีนบุรี",
        "subDistricts": [
          {
            "name": "หน้าเมือง",
            "postalCode": "25000"
          },
          {
            "name": "รอบเมือง",
            "postalCode": "25000"
          },
          {
            "name": "วัดโบสถ์",
            "postalCode": "25000"
          },
          {
            "name": "บางเดชะ",
            "postalCode": "25000"
          },
          {
            "name": "ท่างาม",
            "postalCode": "25000"
          },
          {
            "name": "บางบริบูรณ์",
            "postalCode": "25000"
          },
          {
            "name": "ดงพระราม",
            "postalCode": "25000"
          },
          {
            "name": "บ้านพระ",
            "postalCode": "25230"
          },
          {
            "name": "โคกไม้ลาย",
            "postalCode": "25230"
          },
          {
            "name": "ไม้เค็ด",
            "postalCode": "25230"
          },
          {
            "name": "ดงขี้เหล็ก",
            "postalCode": "25000"
          },
          {
            "name": "เนินหอม",
            "postalCode": "25230"
          },
          {
            "name": "โนนห้อม",
            "postalCode": "25000"
          }
        ]
      },
      {
        "name": "กบินทร์บุรี",
        "subDistricts": [
          {
            "name": "กบินทร์",
            "postalCode": "25110"
          },
          {
            "name": "เมืองเก่า",
            "postalCode": "25240"
          },
          {
            "name": "วังดาล",
            "postalCode": "25110"
          },
          {
            "name": "นนทรี",
            "postalCode": "25110"
          },
          {
            "name": "ย่านรี",
            "postalCode": "25110"
          },
          {
            "name": "วังตะเคียน",
            "postalCode": "25110"
          },
          {
            "name": "หาดนางแก้ว",
            "postalCode": "25110"
          },
          {
            "name": "ลาดตะเคียน",
            "postalCode": "25110"
          },
          {
            "name": "บ้านนา",
            "postalCode": "25110"
          },
          {
            "name": "บ่อทอง",
            "postalCode": "25110"
          },
          {
            "name": "หนองกี่",
            "postalCode": "25110"
          },
          {
            "name": "นาแขม",
            "postalCode": "25110"
          },
          {
            "name": "เขาไม้แก้ว",
            "postalCode": "25110"
          },
          {
            "name": "วังท่าช้าง",
            "postalCode": "25110"
          }
        ]
      },
      {
        "name": "นาดี",
        "subDistricts": [
          {
            "name": "นาดี",
            "postalCode": "25220"
          },
          {
            "name": "สำพันตา",
            "postalCode": "25220"
          },
          {
            "name": "สะพานหิน",
            "postalCode": "25220"
          },
          {
            "name": "ทุ่งโพธิ์",
            "postalCode": "25220"
          },
          {
            "name": "แก่งดินสอ",
            "postalCode": "25220"
          },
          {
            "name": "บุพราหมณ์",
            "postalCode": "25220"
          }
        ]
      },
      {
        "name": "บ้านสร้าง",
        "subDistricts": [
          {
            "name": "บ้านสร้าง",
            "postalCode": "25150"
          },
          {
            "name": "บางกระเบา",
            "postalCode": "25150"
          },
          {
            "name": "บางเตย",
            "postalCode": "25150"
          },
          {
            "name": "บางยาง",
            "postalCode": "25150"
          },
          {
            "name": "บางแตน",
            "postalCode": "25150"
          },
          {
            "name": "บางพลวง",
            "postalCode": "25150"
          },
          {
            "name": "บางปลาร้า",
            "postalCode": "25150"
          },
          {
            "name": "บางขาม",
            "postalCode": "25150"
          },
          {
            "name": "กระทุ่มแพ้ว",
            "postalCode": "25150"
          }
        ]
      },
      {
        "name": "ประจันตคาม",
        "subDistricts": [
          {
            "name": "ประจันตคาม",
            "postalCode": "25130"
          },
          {
            "name": "เกาะลอย",
            "postalCode": "25130"
          },
          {
            "name": "บ้านหอย",
            "postalCode": "25130"
          },
          {
            "name": "หนองแสง",
            "postalCode": "25130"
          },
          {
            "name": "ดงบัง",
            "postalCode": "25130"
          },
          {
            "name": "คำโตนด",
            "postalCode": "25130"
          },
          {
            "name": "บุฝ้าย",
            "postalCode": "25130"
          },
          {
            "name": "หนองแก้ว",
            "postalCode": "25130"
          },
          {
            "name": "โพธิ์งาม",
            "postalCode": "25130"
          }
        ]
      },
      {
        "name": "ศรีมหาโพธิ",
        "subDistricts": [
          {
            "name": "ศรีมหาโพธิ",
            "postalCode": "25140"
          },
          {
            "name": "สัมพันธ์",
            "postalCode": "25140"
          },
          {
            "name": "บ้านทาม",
            "postalCode": "25140"
          },
          {
            "name": "ท่าตูม",
            "postalCode": "25140"
          },
          {
            "name": "บางกุ้ง",
            "postalCode": "25140"
          },
          {
            "name": "ดงกระทงยาม",
            "postalCode": "25140"
          },
          {
            "name": "หนองโพรง",
            "postalCode": "25140"
          },
          {
            "name": "หัวหว้า",
            "postalCode": "25140"
          },
          {
            "name": "หาดยาง",
            "postalCode": "25140"
          },
          {
            "name": "กรอกสมบูรณ์",
            "postalCode": "25140"
          }
        ]
      },
      {
        "name": "ศรีมโหสถ",
        "subDistricts": [
          {
            "name": "โคกปีบ",
            "postalCode": "25190"
          },
          {
            "name": "โคกไทย",
            "postalCode": "25190"
          },
          {
            "name": "คู้ลำพัน",
            "postalCode": "25190"
          },
          {
            "name": "ไผ่ชะเลือด",
            "postalCode": "25190"
          }
        ]
      }
    ]
  },
  {
    "name": "นครนายก",
    "districts": [
      {
        "name": "เมืองนครนายก",
        "subDistricts": [
          {
            "name": "นครนายก",
            "postalCode": "26000"
          },
          {
            "name": "ท่าช้าง",
            "postalCode": "26000"
          },
          {
            "name": "บ้านใหญ่",
            "postalCode": "26000"
          },
          {
            "name": "วังกระโจม",
            "postalCode": "26000"
          },
          {
            "name": "ท่าทราย",
            "postalCode": "26000"
          },
          {
            "name": "ดอนยอ",
            "postalCode": "26000"
          },
          {
            "name": "ศรีจุฬา",
            "postalCode": "26000"
          },
          {
            "name": "ดงละคร",
            "postalCode": "26000"
          },
          {
            "name": "ศรีนาวา",
            "postalCode": "26000"
          },
          {
            "name": "สาริกา",
            "postalCode": "26000"
          },
          {
            "name": "หินตั้ง",
            "postalCode": "26000"
          },
          {
            "name": "เขาพระ",
            "postalCode": "26000"
          },
          {
            "name": "พรหมณี",
            "postalCode": "26000"
          }
        ]
      },
      {
        "name": "ปากพลี",
        "subDistricts": [
          {
            "name": "เกาะหวาย",
            "postalCode": "26130"
          },
          {
            "name": "เกาะโพธิ์",
            "postalCode": "26130"
          },
          {
            "name": "ปากพลี",
            "postalCode": "26130"
          },
          {
            "name": "โคกกรวด",
            "postalCode": "26130"
          },
          {
            "name": "ท่าเรือ",
            "postalCode": "26130"
          },
          {
            "name": "หนองแสง",
            "postalCode": "26130"
          },
          {
            "name": "นาหินลาด",
            "postalCode": "26130"
          }
        ]
      },
      {
        "name": "บ้านนา",
        "subDistricts": [
          {
            "name": "บ้านนา",
            "postalCode": "26110"
          },
          {
            "name": "บ้านพร้าว",
            "postalCode": "26110"
          },
          {
            "name": "บ้านพริก",
            "postalCode": "26110"
          },
          {
            "name": "อาษา",
            "postalCode": "26110"
          },
          {
            "name": "ทองหลาง",
            "postalCode": "26110"
          },
          {
            "name": "บางอ้อ",
            "postalCode": "26110"
          },
          {
            "name": "พิกุลออก",
            "postalCode": "26110"
          },
          {
            "name": "ป่าขะ",
            "postalCode": "26110"
          },
          {
            "name": "เขาเพิ่ม",
            "postalCode": "26110"
          },
          {
            "name": "ศรีกะอาง",
            "postalCode": "26110"
          }
        ]
      },
      {
        "name": "องครักษ์",
        "subDistricts": [
          {
            "name": "พระอาจารย์",
            "postalCode": "26120"
          },
          {
            "name": "บึงศาล",
            "postalCode": "26120"
          },
          {
            "name": "ศีรษะกระบือ",
            "postalCode": "26120"
          },
          {
            "name": "โพธิ์แทน",
            "postalCode": "26120"
          },
          {
            "name": "บางสมบูรณ์",
            "postalCode": "26120"
          },
          {
            "name": "ทรายมูล",
            "postalCode": "26120"
          },
          {
            "name": "บางปลากด",
            "postalCode": "26120"
          },
          {
            "name": "บางลูกเสือ",
            "postalCode": "26120"
          },
          {
            "name": "องครักษ์",
            "postalCode": "26120"
          },
          {
            "name": "ชุมพล",
            "postalCode": "26120"
          },
          {
            "name": "คลองใหญ่",
            "postalCode": "26120"
          }
        ]
      }
    ]
  },
  {
    "name": "สระแก้ว",
    "districts": [
      {
        "name": "เมืองสระแก้ว",
        "subDistricts": [
          {
            "name": "สระแก้ว",
            "postalCode": "27000"
          },
          {
            "name": "บ้านแก้ง",
            "postalCode": "27000"
          },
          {
            "name": "ศาลาลำดวน",
            "postalCode": "27000"
          },
          {
            "name": "โคกปี่ฆ้อง",
            "postalCode": "27000"
          },
          {
            "name": "ท่าแยก",
            "postalCode": "27000"
          },
          {
            "name": "ท่าเกษม",
            "postalCode": "27000"
          },
          {
            "name": "สระขวัญ",
            "postalCode": "27000"
          },
          {
            "name": "หนองบอน",
            "postalCode": "27000"
          }
        ]
      },
      {
        "name": "คลองหาด",
        "subDistricts": [
          {
            "name": "คลองหาด",
            "postalCode": "27260"
          },
          {
            "name": "ไทยอุดม",
            "postalCode": "27260"
          },
          {
            "name": "ซับมะกรูด",
            "postalCode": "27260"
          },
          {
            "name": "ไทรเดี่ยว",
            "postalCode": "27260"
          },
          {
            "name": "คลองไก่เถื่อน",
            "postalCode": "27260"
          },
          {
            "name": "เบญจขร",
            "postalCode": "27260"
          },
          {
            "name": "ไทรทอง",
            "postalCode": "27260"
          }
        ]
      },
      {
        "name": "ตาพระยา",
        "subDistricts": [
          {
            "name": "ตาพระยา",
            "postalCode": "27180"
          },
          {
            "name": "ทัพเสด็จ",
            "postalCode": "27180"
          },
          {
            "name": "ทัพราช",
            "postalCode": "27180"
          },
          {
            "name": "ทัพไทย",
            "postalCode": "27180"
          },
          {
            "name": "โคคลาน",
            "postalCode": "27180"
          }
        ]
      },
      {
        "name": "วังน้ำเย็น",
        "subDistricts": [
          {
            "name": "วังน้ำเย็น",
            "postalCode": "27210"
          },
          {
            "name": "ตาหลังใน",
            "postalCode": "27210"
          },
          {
            "name": "คลองหินปูน",
            "postalCode": "27210"
          },
          {
            "name": "ทุ่งมหาเจริญ",
            "postalCode": "27210"
          }
        ]
      },
      {
        "name": "วัฒนานคร",
        "subDistricts": [
          {
            "name": "วัฒนานคร",
            "postalCode": "27160"
          },
          {
            "name": "ท่าเกวียน",
            "postalCode": "27160"
          },
          {
            "name": "ผักขะ",
            "postalCode": "27160"
          },
          {
            "name": "โนนหมากเค็ง",
            "postalCode": "27160"
          },
          {
            "name": "หนองน้ำใส",
            "postalCode": "27160"
          },
          {
            "name": "ช่องกุ่ม",
            "postalCode": "27160"
          },
          {
            "name": "หนองแวง",
            "postalCode": "27160"
          },
          {
            "name": "แซร์ออ",
            "postalCode": "27160"
          },
          {
            "name": "หนองหมากฝ้าย",
            "postalCode": "27160"
          },
          {
            "name": "หนองตะเคียนบอน",
            "postalCode": "27160"
          },
          {
            "name": "ห้วยโจด",
            "postalCode": "27160"
          }
        ]
      },
      {
        "name": "อรัญประเทศ",
        "subDistricts": [
          {
            "name": "อรัญประเทศ",
            "postalCode": "27120"
          },
          {
            "name": "เมืองไผ่",
            "postalCode": "27120"
          },
          {
            "name": "หันทราย",
            "postalCode": "27120"
          },
          {
            "name": "คลองน้ำใส",
            "postalCode": "27120"
          },
          {
            "name": "ท่าข้าม",
            "postalCode": "27120"
          },
          {
            "name": "ป่าไร่",
            "postalCode": "27120"
          },
          {
            "name": "ทับพริก",
            "postalCode": "27120"
          },
          {
            "name": "บ้านใหม่หนองไทร",
            "postalCode": "27120"
          },
          {
            "name": "ผ่านศึก",
            "postalCode": "27120"
          },
          {
            "name": "หนองสังข์",
            "postalCode": "27120"
          },
          {
            "name": "คลองทับจันทร์",
            "postalCode": "27120"
          },
          {
            "name": "ฟากห้วย",
            "postalCode": "27120"
          },
          {
            "name": "บ้านด่าน",
            "postalCode": "27120"
          }
        ]
      },
      {
        "name": "เขาฉกรรจ์",
        "subDistricts": [
          {
            "name": "เขาฉกรรจ์",
            "postalCode": "27000"
          },
          {
            "name": "หนองหว้า",
            "postalCode": "27000"
          },
          {
            "name": "พระเพลิง",
            "postalCode": "27000"
          },
          {
            "name": "เขาสามสิบ",
            "postalCode": "27000"
          }
        ]
      },
      {
        "name": "โคกสูง",
        "subDistricts": [
          {
            "name": "โคกสูง",
            "postalCode": "27120"
          },
          {
            "name": "หนองม่วง",
            "postalCode": "27180"
          },
          {
            "name": "หนองแวง",
            "postalCode": "27180"
          },
          {
            "name": "โนนหมากมุ่น",
            "postalCode": "27120"
          }
        ]
      },
      {
        "name": "วังสมบูรณ์",
        "subDistricts": [
          {
            "name": "วังสมบูรณ์",
            "postalCode": "27250"
          },
          {
            "name": "วังใหม่",
            "postalCode": "27250"
          },
          {
            "name": "วังทอง",
            "postalCode": "27250"
          }
        ]
      }
    ]
  },
  {
    "name": "นครราชสีมา",
    "districts": [
      {
        "name": "เมืองนครราชสีมา",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "30000"
          },
          {
            "name": "โพธิ์กลาง",
            "postalCode": "30000"
          },
          {
            "name": "หนองจะบก",
            "postalCode": "30000"
          },
          {
            "name": "โคกสูง",
            "postalCode": "30310"
          },
          {
            "name": "มะเริง",
            "postalCode": "30000"
          },
          {
            "name": "หนองระเวียง",
            "postalCode": "30000"
          },
          {
            "name": "ปรุใหญ่",
            "postalCode": "30000"
          },
          {
            "name": "หมื่นไวย",
            "postalCode": "30000"
          },
          {
            "name": "พลกรัง",
            "postalCode": "30000"
          },
          {
            "name": "หนองไผ่ล้อม",
            "postalCode": "30000"
          },
          {
            "name": "หัวทะเล",
            "postalCode": "30000"
          },
          {
            "name": "บ้านเกาะ",
            "postalCode": "30000"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "30000"
          },
          {
            "name": "พุดซา",
            "postalCode": "30000"
          },
          {
            "name": "บ้านโพธิ์",
            "postalCode": "30310"
          },
          {
            "name": "จอหอ",
            "postalCode": "30310"
          },
          {
            "name": "โคกกรวด",
            "postalCode": "30280"
          },
          {
            "name": "ไชยมงคล",
            "postalCode": "30000"
          },
          {
            "name": "หนองบัวศาลา",
            "postalCode": "30000"
          },
          {
            "name": "สุรนารี",
            "postalCode": "30000"
          },
          {
            "name": "สีมุม",
            "postalCode": "30000"
          },
          {
            "name": "ตลาด",
            "postalCode": "30310"
          },
          {
            "name": "พะเนา",
            "postalCode": "30000"
          },
          {
            "name": "หนองกระทุ่ม",
            "postalCode": "30000"
          },
          {
            "name": "หนองไข่น้ำ",
            "postalCode": "30310"
          }
        ]
      },
      {
        "name": "ครบุรี",
        "subDistricts": [
          {
            "name": "แชะ",
            "postalCode": "30250"
          },
          {
            "name": "เฉลียง",
            "postalCode": "30250"
          },
          {
            "name": "ครบุรี",
            "postalCode": "30250"
          },
          {
            "name": "โคกกระชาย",
            "postalCode": "30250"
          },
          {
            "name": "จระเข้หิน",
            "postalCode": "30250"
          },
          {
            "name": "มาบตะโกเอน",
            "postalCode": "30250"
          },
          {
            "name": "อรพิมพ์",
            "postalCode": "30250"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "30250"
          },
          {
            "name": "ลำเพียก",
            "postalCode": "30250"
          },
          {
            "name": "ครบุรีใต้",
            "postalCode": "30250"
          },
          {
            "name": "ตะแบกบาน",
            "postalCode": "30250"
          },
          {
            "name": "สระว่านพระยา",
            "postalCode": "30250"
          }
        ]
      },
      {
        "name": "เสิงสาง",
        "subDistricts": [
          {
            "name": "เสิงสาง",
            "postalCode": "30330"
          },
          {
            "name": "สระตะเคียน",
            "postalCode": "30330"
          },
          {
            "name": "โนนสมบูรณ์",
            "postalCode": "30330"
          },
          {
            "name": "กุดโบสถ์",
            "postalCode": "30330"
          },
          {
            "name": "สุขไพบูลย์",
            "postalCode": "30330"
          },
          {
            "name": "บ้านราษฎร์",
            "postalCode": "30330"
          }
        ]
      },
      {
        "name": "คง",
        "subDistricts": [
          {
            "name": "เมืองคง",
            "postalCode": "30260"
          },
          {
            "name": "คูขาด",
            "postalCode": "30260"
          },
          {
            "name": "เทพาลัย",
            "postalCode": "30260"
          },
          {
            "name": "ตาจั่น",
            "postalCode": "30260"
          },
          {
            "name": "บ้านปรางค์",
            "postalCode": "30260"
          },
          {
            "name": "หนองมะนาว",
            "postalCode": "30260"
          },
          {
            "name": "หนองบัว",
            "postalCode": "30260"
          },
          {
            "name": "โนนเต็ง",
            "postalCode": "30260"
          },
          {
            "name": "ดอนใหญ่",
            "postalCode": "30260"
          },
          {
            "name": "ขามสมบูรณ์",
            "postalCode": "30260"
          }
        ]
      },
      {
        "name": "บ้านเหลื่อม",
        "subDistricts": [
          {
            "name": "บ้านเหลื่อม",
            "postalCode": "30350"
          },
          {
            "name": "วังโพธิ์",
            "postalCode": "30350"
          },
          {
            "name": "โคกกระเบื้อง",
            "postalCode": "30350"
          },
          {
            "name": "ช่อระกา",
            "postalCode": "30350"
          }
        ]
      },
      {
        "name": "จักราช",
        "subDistricts": [
          {
            "name": "จักราช",
            "postalCode": "30230"
          },
          {
            "name": "ท่าช้าง",
            "postalCode": "30230"
          },
          {
            "name": "ทองหลาง",
            "postalCode": "30230"
          },
          {
            "name": "สีสุก",
            "postalCode": "30230"
          },
          {
            "name": "หนองขาม",
            "postalCode": "30230"
          },
          {
            "name": "หนองงูเหลือม",
            "postalCode": "30230"
          },
          {
            "name": "หนองพลวง",
            "postalCode": "30230"
          },
          {
            "name": "หนองยาง",
            "postalCode": "30230"
          },
          {
            "name": "พระพุทธ",
            "postalCode": "30230"
          },
          {
            "name": "ศรีละกอ",
            "postalCode": "30230"
          },
          {
            "name": "คลองเมือง",
            "postalCode": "30230"
          },
          {
            "name": "ช้างทอง",
            "postalCode": "30230"
          },
          {
            "name": "หินโคน",
            "postalCode": "30230"
          }
        ]
      },
      {
        "name": "โชคชัย",
        "subDistricts": [
          {
            "name": "กระโทก",
            "postalCode": "30190"
          },
          {
            "name": "พลับพลา",
            "postalCode": "30190"
          },
          {
            "name": "ท่าอ่าง",
            "postalCode": "30190"
          },
          {
            "name": "ทุ่งอรุณ",
            "postalCode": "30190"
          },
          {
            "name": "ท่าลาดขาว",
            "postalCode": "30190"
          },
          {
            "name": "ท่าจะหลุง",
            "postalCode": "30190"
          },
          {
            "name": "ท่าเยี่ยม",
            "postalCode": "30190"
          },
          {
            "name": "โชคชัย",
            "postalCode": "30190"
          },
          {
            "name": "ละลมใหม่พัฒนา",
            "postalCode": "30190"
          },
          {
            "name": "ด่านเกวียน",
            "postalCode": "30190"
          }
        ]
      },
      {
        "name": "ด่านขุนทด",
        "subDistricts": [
          {
            "name": "กุดพิมาน",
            "postalCode": "30210"
          },
          {
            "name": "ด่านขุนทด",
            "postalCode": "30210"
          },
          {
            "name": "ด่านนอก",
            "postalCode": "30210"
          },
          {
            "name": "ด่านใน",
            "postalCode": "30210"
          },
          {
            "name": "ตะเคียน",
            "postalCode": "30210"
          },
          {
            "name": "บ้านเก่า",
            "postalCode": "30210"
          },
          {
            "name": "บ้านแปรง",
            "postalCode": "36220"
          },
          {
            "name": "พันชนะ",
            "postalCode": "30210"
          },
          {
            "name": "สระจรเข้",
            "postalCode": "30210"
          },
          {
            "name": "หนองกราด",
            "postalCode": "30210"
          },
          {
            "name": "หนองบัวตะเกียด",
            "postalCode": "30210"
          },
          {
            "name": "หนองบัวละคร",
            "postalCode": "30210"
          },
          {
            "name": "หินดาด",
            "postalCode": "30210"
          },
          {
            "name": "ห้วยบง",
            "postalCode": "30210"
          },
          {
            "name": "โนนเมืองพัฒนา",
            "postalCode": "30210"
          },
          {
            "name": "หนองไทร",
            "postalCode": "36220"
          }
        ]
      },
      {
        "name": "โนนไทย",
        "subDistricts": [
          {
            "name": "โนนไทย",
            "postalCode": "30220"
          },
          {
            "name": "ด่านจาก",
            "postalCode": "30220"
          },
          {
            "name": "กำปัง",
            "postalCode": "30220"
          },
          {
            "name": "สำโรง",
            "postalCode": "30220"
          },
          {
            "name": "ค้างพลู",
            "postalCode": "30220"
          },
          {
            "name": "บ้านวัง",
            "postalCode": "30220"
          },
          {
            "name": "บัลลังก์",
            "postalCode": "30220"
          },
          {
            "name": "สายออ",
            "postalCode": "30220"
          },
          {
            "name": "ถนนโพธิ์",
            "postalCode": "30220"
          },
          {
            "name": "พังเทียม",
            "postalCode": "30220"
          },
          {
            "name": "สระพระ",
            "postalCode": "30220"
          },
          {
            "name": "ทัพรั้ง",
            "postalCode": "30220"
          },
          {
            "name": "หนองหอย",
            "postalCode": "30220"
          },
          {
            "name": "มะค่า",
            "postalCode": "30220"
          },
          {
            "name": "มาบกราด",
            "postalCode": "30220"
          }
        ]
      },
      {
        "name": "โนนสูง",
        "subDistricts": [
          {
            "name": "โนนสูง",
            "postalCode": "30160"
          },
          {
            "name": "ใหม่",
            "postalCode": "30160"
          },
          {
            "name": "โตนด",
            "postalCode": "30160"
          },
          {
            "name": "บิง",
            "postalCode": "30160"
          },
          {
            "name": "ดอนชมพู",
            "postalCode": "30160"
          },
          {
            "name": "ธารปราสาท",
            "postalCode": "30240"
          },
          {
            "name": "หลุมข้าว",
            "postalCode": "30160"
          },
          {
            "name": "มะค่า",
            "postalCode": "30160"
          },
          {
            "name": "พลสงคราม",
            "postalCode": "30160"
          },
          {
            "name": "จันอัด",
            "postalCode": "30160"
          },
          {
            "name": "ขามเฒ่า",
            "postalCode": "30160"
          },
          {
            "name": "ด่านคล้า",
            "postalCode": "30160"
          },
          {
            "name": "ลำคอหงษ์",
            "postalCode": "30160"
          },
          {
            "name": "เมืองปราสาท",
            "postalCode": "30160"
          },
          {
            "name": "ดอนหวาย",
            "postalCode": "30160"
          },
          {
            "name": "ลำมูล",
            "postalCode": "30160"
          }
        ]
      },
      {
        "name": "ขามสะแกแสง",
        "subDistricts": [
          {
            "name": "ขามสะแกแสง",
            "postalCode": "30290"
          },
          {
            "name": "โนนเมือง",
            "postalCode": "30290"
          },
          {
            "name": "เมืองนาท",
            "postalCode": "30290"
          },
          {
            "name": "ชีวึก",
            "postalCode": "30290"
          },
          {
            "name": "พะงาด",
            "postalCode": "30290"
          },
          {
            "name": "หนองหัวฟาน",
            "postalCode": "30290"
          },
          {
            "name": "เมืองเกษตร",
            "postalCode": "30290"
          }
        ]
      },
      {
        "name": "บัวใหญ่",
        "subDistricts": [
          {
            "name": "บัวใหญ่",
            "postalCode": "30120"
          },
          {
            "name": "ห้วยยาง",
            "postalCode": "30120"
          },
          {
            "name": "เสมาใหญ่",
            "postalCode": "30120"
          },
          {
            "name": "ดอนตะหนิน",
            "postalCode": "30120"
          },
          {
            "name": "หนองบัวสะอาด",
            "postalCode": "30120"
          },
          {
            "name": "โนนทองหลาง",
            "postalCode": "30120"
          },
          {
            "name": "หนองหว้า",
            "postalCode": "30120"
          },
          {
            "name": "บัวลาย",
            "postalCode": "30120"
          },
          {
            "name": "สีดา",
            "postalCode": "30120"
          },
          {
            "name": "โพนทอง",
            "postalCode": "30120"
          },
          {
            "name": "กุดจอก",
            "postalCode": "30120"
          },
          {
            "name": "ด่านช้าง",
            "postalCode": "30120"
          },
          {
            "name": "โนนจาน",
            "postalCode": "30120"
          },
          {
            "name": "สามเมือง",
            "postalCode": "30120"
          },
          {
            "name": "ขุนทอง",
            "postalCode": "30120"
          },
          {
            "name": "หนองตาดใหญ่",
            "postalCode": "30120"
          },
          {
            "name": "เมืองพะไล",
            "postalCode": "30120"
          },
          {
            "name": "โนนประดู่",
            "postalCode": "30120"
          },
          {
            "name": "หนองแจ้งใหญ่",
            "postalCode": "30120"
          }
        ]
      },
      {
        "name": "ประทาย",
        "subDistricts": [
          {
            "name": "ประทาย",
            "postalCode": "30180"
          },
          {
            "name": "กระทุ่มราย",
            "postalCode": "30180"
          },
          {
            "name": "วังไม้แดง",
            "postalCode": "30180"
          },
          {
            "name": "ตลาดไทร",
            "postalCode": "30180"
          },
          {
            "name": "หนองพลวง",
            "postalCode": "30180"
          },
          {
            "name": "หนองค่าย",
            "postalCode": "30180"
          },
          {
            "name": "หันห้วยทราย",
            "postalCode": "30180"
          },
          {
            "name": "ดอนมัน",
            "postalCode": "30180"
          },
          {
            "name": "นางรำ",
            "postalCode": "30180"
          },
          {
            "name": "โนนเพ็ด",
            "postalCode": "30180"
          },
          {
            "name": "ทุ่งสว่าง",
            "postalCode": "30180"
          },
          {
            "name": "โคกกลาง",
            "postalCode": "30180"
          },
          {
            "name": "เมืองโดน",
            "postalCode": "30180"
          }
        ]
      },
      {
        "name": "ปักธงชัย",
        "subDistricts": [
          {
            "name": "เมืองปัก",
            "postalCode": "30150"
          },
          {
            "name": "ตะคุ",
            "postalCode": "30150"
          },
          {
            "name": "โคกไทย",
            "postalCode": "30150"
          },
          {
            "name": "สำโรง",
            "postalCode": "30150"
          },
          {
            "name": "ตะขบ",
            "postalCode": "30150"
          },
          {
            "name": "นกออก",
            "postalCode": "30150"
          },
          {
            "name": "ดอน",
            "postalCode": "30150"
          },
          {
            "name": "ตูม",
            "postalCode": "30150"
          },
          {
            "name": "งิ้ว",
            "postalCode": "30150"
          },
          {
            "name": "สะแกราช",
            "postalCode": "30150"
          },
          {
            "name": "ลำนางแก้ว",
            "postalCode": "30150"
          },
          {
            "name": "ภูหลวง",
            "postalCode": "30150"
          },
          {
            "name": "ธงชัยเหนือ",
            "postalCode": "30150"
          },
          {
            "name": "สุขเกษม",
            "postalCode": "30150"
          },
          {
            "name": "เกษมทรัพย์",
            "postalCode": "30150"
          },
          {
            "name": "บ่อปลาทอง",
            "postalCode": "30150"
          }
        ]
      },
      {
        "name": "พิมาย",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "30110"
          },
          {
            "name": "สัมฤทธิ์",
            "postalCode": "30110"
          },
          {
            "name": "โบสถ์",
            "postalCode": "30110"
          },
          {
            "name": "กระเบื้องใหญ่",
            "postalCode": "30110"
          },
          {
            "name": "ท่าหลวง",
            "postalCode": "30110"
          },
          {
            "name": "รังกาใหญ่",
            "postalCode": "30110"
          },
          {
            "name": "ชีวาน",
            "postalCode": "30110"
          },
          {
            "name": "นิคมสร้างตนเอง",
            "postalCode": "30110"
          },
          {
            "name": "กระชอน",
            "postalCode": "30110"
          },
          {
            "name": "ดงใหญ่",
            "postalCode": "30110"
          },
          {
            "name": "ธารละหลอด",
            "postalCode": "30110"
          },
          {
            "name": "หนองระเวียง",
            "postalCode": "30110"
          }
        ]
      },
      {
        "name": "ห้วยแถลง",
        "subDistricts": [
          {
            "name": "ห้วยแถลง",
            "postalCode": "30240"
          },
          {
            "name": "ทับสวาย",
            "postalCode": "30240"
          },
          {
            "name": "เมืองพลับพลา",
            "postalCode": "30240"
          },
          {
            "name": "หลุ่งตะเคียน",
            "postalCode": "30240"
          },
          {
            "name": "หินดาด",
            "postalCode": "30240"
          },
          {
            "name": "งิ้ว",
            "postalCode": "30240"
          },
          {
            "name": "กงรถ",
            "postalCode": "30240"
          },
          {
            "name": "หลุ่งประดู่",
            "postalCode": "30240"
          },
          {
            "name": "ตะโก",
            "postalCode": "30240"
          },
          {
            "name": "ห้วยแคน",
            "postalCode": "30240"
          }
        ]
      },
      {
        "name": "ชุมพวง",
        "subDistricts": [
          {
            "name": "ชุมพวง",
            "postalCode": "30270"
          },
          {
            "name": "ประสุข",
            "postalCode": "30270"
          },
          {
            "name": "ท่าลาด",
            "postalCode": "30270"
          },
          {
            "name": "สาหร่าย",
            "postalCode": "30270"
          },
          {
            "name": "ตลาดไทร",
            "postalCode": "30270"
          },
          {
            "name": "ช่องแมว",
            "postalCode": "30270"
          },
          {
            "name": "ขุย",
            "postalCode": "30270"
          },
          {
            "name": "โนนรัง",
            "postalCode": "30270"
          },
          {
            "name": "บ้านยาง",
            "postalCode": "30270"
          },
          {
            "name": "หนองหลัก",
            "postalCode": "30270"
          },
          {
            "name": "ไพล",
            "postalCode": "30270"
          },
          {
            "name": "โนนตูม",
            "postalCode": "30270"
          },
          {
            "name": "โนนยอ",
            "postalCode": "30270"
          }
        ]
      },
      {
        "name": "สูงเนิน",
        "subDistricts": [
          {
            "name": "สูงเนิน",
            "postalCode": "30170"
          },
          {
            "name": "เสมา",
            "postalCode": "30170"
          },
          {
            "name": "โคราช",
            "postalCode": "30170"
          },
          {
            "name": "บุ่งขี้เหล็ก",
            "postalCode": "30170"
          },
          {
            "name": "โนนค่า",
            "postalCode": "30170"
          },
          {
            "name": "โค้งยาง",
            "postalCode": "30170"
          },
          {
            "name": "มะเกลือเก่า",
            "postalCode": "30170"
          },
          {
            "name": "มะเกลือใหม่",
            "postalCode": "30170"
          },
          {
            "name": "นากลาง",
            "postalCode": "30380"
          },
          {
            "name": "หนองตะไก้",
            "postalCode": "30380"
          },
          {
            "name": "กุดจิก",
            "postalCode": "30380"
          }
        ]
      },
      {
        "name": "ขามทะเลสอ",
        "subDistricts": [
          {
            "name": "ขามทะเลสอ",
            "postalCode": "30280"
          },
          {
            "name": "โป่งแดง",
            "postalCode": "30280"
          },
          {
            "name": "พันดุง",
            "postalCode": "30280"
          },
          {
            "name": "หนองสรวง",
            "postalCode": "30280"
          },
          {
            "name": "บึงอ้อ",
            "postalCode": "30280"
          }
        ]
      },
      {
        "name": "สีคิ้ว",
        "subDistricts": [
          {
            "name": "สีคิ้ว",
            "postalCode": "30140"
          },
          {
            "name": "บ้านหัน",
            "postalCode": "30140"
          },
          {
            "name": "กฤษณา",
            "postalCode": "30140"
          },
          {
            "name": "ลาดบัวขาว",
            "postalCode": "30340"
          },
          {
            "name": "หนองหญ้าขาว",
            "postalCode": "30140"
          },
          {
            "name": "กุดน้อย",
            "postalCode": "30140"
          },
          {
            "name": "หนองน้ำใส",
            "postalCode": "30140"
          },
          {
            "name": "วังโรงใหญ่",
            "postalCode": "30140"
          },
          {
            "name": "มิตรภาพ",
            "postalCode": "30140"
          },
          {
            "name": "คลองไผ่",
            "postalCode": "30340"
          },
          {
            "name": "ดอนเมือง",
            "postalCode": "30140"
          },
          {
            "name": "หนองบัวน้อย",
            "postalCode": "30140"
          }
        ]
      },
      {
        "name": "ปากช่อง",
        "subDistricts": [
          {
            "name": "ปากช่อง",
            "postalCode": "30130"
          },
          {
            "name": "กลางดง",
            "postalCode": "30320"
          },
          {
            "name": "จันทึก",
            "postalCode": "30130"
          },
          {
            "name": "วังกะทะ",
            "postalCode": "30130"
          },
          {
            "name": "หมูสี",
            "postalCode": "30130"
          },
          {
            "name": "หนองสาหร่าย",
            "postalCode": "30130"
          },
          {
            "name": "ขนงพระ",
            "postalCode": "30130"
          },
          {
            "name": "โป่งตาลอง",
            "postalCode": "30130"
          },
          {
            "name": "คลองม่วง",
            "postalCode": "30130"
          },
          {
            "name": "หนองน้ำแดง",
            "postalCode": "30130"
          },
          {
            "name": "วังไทร",
            "postalCode": "30130"
          },
          {
            "name": "พญาเย็น",
            "postalCode": "30320"
          }
        ]
      },
      {
        "name": "หนองบุญมาก",
        "subDistricts": [
          {
            "name": "หนองบุนนาก",
            "postalCode": "30410"
          },
          {
            "name": "สารภี",
            "postalCode": "30410"
          },
          {
            "name": "ไทยเจริญ",
            "postalCode": "30410"
          },
          {
            "name": "หนองหัวแรต",
            "postalCode": "30410"
          },
          {
            "name": "แหลมทอง",
            "postalCode": "30410"
          },
          {
            "name": "หนองตะไก้",
            "postalCode": "30410"
          },
          {
            "name": "ลุงเขว้า",
            "postalCode": "30410"
          },
          {
            "name": "หนองไม้ไผ่",
            "postalCode": "30410"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "30410"
          }
        ]
      },
      {
        "name": "แก้งสนามนาง",
        "subDistricts": [
          {
            "name": "แก้งสนามนาง",
            "postalCode": "30440"
          },
          {
            "name": "โนนสำราญ",
            "postalCode": "30440"
          },
          {
            "name": "บึงพะไล",
            "postalCode": "30440"
          },
          {
            "name": "สีสุก",
            "postalCode": "30440"
          },
          {
            "name": "บึงสำโรง",
            "postalCode": "30440"
          }
        ]
      },
      {
        "name": "โนนแดง",
        "subDistricts": [
          {
            "name": "โนนแดง",
            "postalCode": "30360"
          },
          {
            "name": "โนนตาเถร",
            "postalCode": "30360"
          },
          {
            "name": "สำพะเนียง",
            "postalCode": "30360"
          },
          {
            "name": "วังหิน",
            "postalCode": "30360"
          },
          {
            "name": "ดอนยาวใหญ่",
            "postalCode": "30360"
          }
        ]
      },
      {
        "name": "วังน้ำเขียว",
        "subDistricts": [
          {
            "name": "วังน้ำเขียว",
            "postalCode": "30370"
          },
          {
            "name": "วังหมี",
            "postalCode": "30370"
          },
          {
            "name": "ระเริง",
            "postalCode": "30150"
          },
          {
            "name": "อุดมทรัพย์",
            "postalCode": "30370"
          },
          {
            "name": "ไทยสามัคคี",
            "postalCode": "30370"
          }
        ]
      },
      {
        "name": "เทพารักษ์",
        "subDistricts": [
          {
            "name": "สำนักตะคร้อ",
            "postalCode": "30210"
          },
          {
            "name": "หนองแวง",
            "postalCode": "30210"
          },
          {
            "name": "บึงปรือ",
            "postalCode": "30210"
          },
          {
            "name": "วังยายทอง",
            "postalCode": "30210"
          }
        ]
      },
      {
        "name": "เมืองยาง",
        "subDistricts": [
          {
            "name": "เมืองยาง",
            "postalCode": "30270"
          },
          {
            "name": "กระเบื้องนอก",
            "postalCode": "30270"
          },
          {
            "name": "ละหานปลาค้าว",
            "postalCode": "30270"
          },
          {
            "name": "โนนอุดม",
            "postalCode": "30270"
          }
        ]
      },
      {
        "name": "พระทองคำ",
        "subDistricts": [
          {
            "name": "สระพระ",
            "postalCode": "30220"
          },
          {
            "name": "มาบกราด",
            "postalCode": "30220"
          },
          {
            "name": "พังเทียม",
            "postalCode": "30220"
          },
          {
            "name": "ทัพรั้ง",
            "postalCode": "30220"
          },
          {
            "name": "หนองหอย",
            "postalCode": "30220"
          }
        ]
      },
      {
        "name": "ลำทะเมนชัย",
        "subDistricts": [
          {
            "name": "ขุย",
            "postalCode": "30270"
          },
          {
            "name": "บ้านยาง",
            "postalCode": "30270"
          },
          {
            "name": "ช่องแมว",
            "postalCode": "30270"
          },
          {
            "name": "ไพล",
            "postalCode": "30270"
          }
        ]
      },
      {
        "name": "บัวลาย",
        "subDistricts": [
          {
            "name": "เมืองพะไล",
            "postalCode": "30120"
          },
          {
            "name": "โนนจาน",
            "postalCode": "30120"
          },
          {
            "name": "บัวลาย",
            "postalCode": "30120"
          },
          {
            "name": "หนองหว้า",
            "postalCode": "30120"
          }
        ]
      },
      {
        "name": "สีดา",
        "subDistricts": [
          {
            "name": "สีดา",
            "postalCode": "30430"
          },
          {
            "name": "โพนทอง",
            "postalCode": "30430"
          },
          {
            "name": "โนนประดู่",
            "postalCode": "30430"
          },
          {
            "name": "สามเมือง",
            "postalCode": "30430"
          },
          {
            "name": "หนองตาดใหญ่",
            "postalCode": "30430"
          }
        ]
      },
      {
        "name": "เฉลิมพระเกียรติ",
        "subDistricts": [
          {
            "name": "ช้างทอง",
            "postalCode": "30230"
          },
          {
            "name": "ท่าช้าง",
            "postalCode": "30230"
          },
          {
            "name": "พระพุทธ",
            "postalCode": "30230"
          },
          {
            "name": "หนองงูเหลือม",
            "postalCode": "30000"
          },
          {
            "name": "หนองยาง",
            "postalCode": "30230"
          }
        ]
      }
    ]
  },
  {
    "name": "บุรีรัมย์",
    "districts": [
      {
        "name": "เมืองบุรีรัมย์",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "31000"
          },
          {
            "name": "อิสาณ",
            "postalCode": "31000"
          },
          {
            "name": "เสม็ด",
            "postalCode": "31000"
          },
          {
            "name": "บ้านบัว",
            "postalCode": "31000"
          },
          {
            "name": "สะแกโพรง",
            "postalCode": "31000"
          },
          {
            "name": "สวายจีก",
            "postalCode": "31000"
          },
          {
            "name": "บ้านยาง",
            "postalCode": "31000"
          },
          {
            "name": "พระครู",
            "postalCode": "31000"
          },
          {
            "name": "ถลุงเหล็ก",
            "postalCode": "31000"
          },
          {
            "name": "หนองตาด",
            "postalCode": "31000"
          },
          {
            "name": "ลุมปุ๊ก",
            "postalCode": "31000"
          },
          {
            "name": "สองห้อง",
            "postalCode": "31000"
          },
          {
            "name": "บัวทอง",
            "postalCode": "31000"
          },
          {
            "name": "ชุมเห็ด",
            "postalCode": "31000"
          },
          {
            "name": "หลักเขต",
            "postalCode": "31000"
          },
          {
            "name": "สะแกซำ",
            "postalCode": "31000"
          },
          {
            "name": "กลันทา",
            "postalCode": "31000"
          },
          {
            "name": "กระสัง",
            "postalCode": "31000"
          },
          {
            "name": "เมืองฝาง",
            "postalCode": "31000"
          }
        ]
      },
      {
        "name": "คูเมือง",
        "subDistricts": [
          {
            "name": "คูเมือง",
            "postalCode": "31190"
          },
          {
            "name": "ปะเคียบ",
            "postalCode": "31190"
          },
          {
            "name": "บ้านแพ",
            "postalCode": "31190"
          },
          {
            "name": "พรสำราญ",
            "postalCode": "31190"
          },
          {
            "name": "หินเหล็กไฟ",
            "postalCode": "31190"
          },
          {
            "name": "ตูมใหญ่",
            "postalCode": "31190"
          },
          {
            "name": "หนองขมาร",
            "postalCode": "31190"
          }
        ]
      },
      {
        "name": "กระสัง",
        "subDistricts": [
          {
            "name": "กระสัง",
            "postalCode": "31160"
          },
          {
            "name": "ลำดวน",
            "postalCode": "31160"
          },
          {
            "name": "สองชั้น",
            "postalCode": "31160"
          },
          {
            "name": "สูงเนิน",
            "postalCode": "31160"
          },
          {
            "name": "หนองเต็ง",
            "postalCode": "31160"
          },
          {
            "name": "เมืองไผ่",
            "postalCode": "31160"
          },
          {
            "name": "ชุมแสง",
            "postalCode": "31160"
          },
          {
            "name": "บ้านปรือ",
            "postalCode": "31160"
          },
          {
            "name": "ห้วยสำราญ",
            "postalCode": "31160"
          },
          {
            "name": "กันทรารมย์",
            "postalCode": "31160"
          },
          {
            "name": "ศรีภูมิ",
            "postalCode": "31160"
          }
        ]
      },
      {
        "name": "นางรอง",
        "subDistricts": [
          {
            "name": "นางรอง",
            "postalCode": "31110"
          },
          {
            "name": "สะเดา",
            "postalCode": "31110"
          },
          {
            "name": "ชุมแสง",
            "postalCode": "31110"
          },
          {
            "name": "หนองโบสถ์",
            "postalCode": "31110"
          },
          {
            "name": "หนองกง",
            "postalCode": "31110"
          },
          {
            "name": "ถนนหัก",
            "postalCode": "31110"
          },
          {
            "name": "หนองไทร",
            "postalCode": "31110"
          },
          {
            "name": "ก้านเหลือง",
            "postalCode": "31110"
          },
          {
            "name": "บ้านสิงห์",
            "postalCode": "31110"
          },
          {
            "name": "ลำไทรโยง",
            "postalCode": "31110"
          },
          {
            "name": "ทรัพย์พระยา",
            "postalCode": "31110"
          },
          {
            "name": "หนองยายพิมพ์",
            "postalCode": "31110"
          },
          {
            "name": "หัวถนน",
            "postalCode": "31110"
          },
          {
            "name": "ทุ่งแสงทอง",
            "postalCode": "31110"
          },
          {
            "name": "หนองโสน",
            "postalCode": "31110"
          }
        ]
      },
      {
        "name": "หนองกี่",
        "subDistricts": [
          {
            "name": "หนองกี่",
            "postalCode": "31210"
          },
          {
            "name": "เย้ยปราสาท",
            "postalCode": "31210"
          },
          {
            "name": "เมืองไผ่",
            "postalCode": "31210"
          },
          {
            "name": "ดอนอะราง",
            "postalCode": "31210"
          },
          {
            "name": "โคกสว่าง",
            "postalCode": "31210"
          },
          {
            "name": "ทุ่งกระตาดพัฒนา",
            "postalCode": "31210"
          },
          {
            "name": "ทุ่งกระเต็น",
            "postalCode": "31210"
          },
          {
            "name": "ท่าโพธิ์ชัย",
            "postalCode": "31210"
          },
          {
            "name": "โคกสูง",
            "postalCode": "31210"
          },
          {
            "name": "บุกระสัง",
            "postalCode": "31210"
          }
        ]
      },
      {
        "name": "ละหานทราย",
        "subDistricts": [
          {
            "name": "ละหานทราย",
            "postalCode": "31170"
          },
          {
            "name": "ตาจง",
            "postalCode": "31170"
          },
          {
            "name": "สำโรงใหม่",
            "postalCode": "31170"
          },
          {
            "name": "หนองแวง",
            "postalCode": "31170"
          },
          {
            "name": "หนองตะครอง",
            "postalCode": "31170"
          },
          {
            "name": "โคกว่าน",
            "postalCode": "31170"
          }
        ]
      },
      {
        "name": "ประโคนชัย",
        "subDistricts": [
          {
            "name": "ประโคนชัย",
            "postalCode": "31140"
          },
          {
            "name": "แสลงโทน",
            "postalCode": "31140"
          },
          {
            "name": "บ้านไทร",
            "postalCode": "31140"
          },
          {
            "name": "ละเวี้ย",
            "postalCode": "31140"
          },
          {
            "name": "จรเข้มาก",
            "postalCode": "31140"
          },
          {
            "name": "ปังกู",
            "postalCode": "31140"
          },
          {
            "name": "โคกย่าง",
            "postalCode": "31140"
          },
          {
            "name": "โคกม้า",
            "postalCode": "31140"
          },
          {
            "name": "ไพศาล",
            "postalCode": "31140"
          },
          {
            "name": "ตะโกตาพิ",
            "postalCode": "31140"
          },
          {
            "name": "เขาคอก",
            "postalCode": "31140"
          },
          {
            "name": "หนองบอน",
            "postalCode": "31140"
          },
          {
            "name": "โคกมะขาม",
            "postalCode": "31140"
          },
          {
            "name": "โคกตูม",
            "postalCode": "31140"
          },
          {
            "name": "ประทัดบุ",
            "postalCode": "31140"
          },
          {
            "name": "สี่เหลี่ยม",
            "postalCode": "31140"
          }
        ]
      },
      {
        "name": "บ้านกรวด",
        "subDistricts": [
          {
            "name": "บ้านกรวด",
            "postalCode": "31180"
          },
          {
            "name": "โนนเจริญ",
            "postalCode": "31180"
          },
          {
            "name": "หนองไม้งาม",
            "postalCode": "31180"
          },
          {
            "name": "ปราสาท",
            "postalCode": "31180"
          },
          {
            "name": "สายตะกู",
            "postalCode": "31180"
          },
          {
            "name": "หินลาด",
            "postalCode": "31180"
          },
          {
            "name": "บึงเจริญ",
            "postalCode": "31180"
          },
          {
            "name": "จันทบเพชร",
            "postalCode": "31180"
          },
          {
            "name": "เขาดินเหนือ",
            "postalCode": "31180"
          }
        ]
      },
      {
        "name": "พุทไธสง",
        "subDistricts": [
          {
            "name": "พุทไธสง",
            "postalCode": "31120"
          },
          {
            "name": "มะเฟือง",
            "postalCode": "31120"
          },
          {
            "name": "บ้านจาน",
            "postalCode": "31120"
          },
          {
            "name": "บ้านเป้า",
            "postalCode": "31120"
          },
          {
            "name": "บ้านแวง",
            "postalCode": "31120"
          },
          {
            "name": "บ้านยาง",
            "postalCode": "31120"
          },
          {
            "name": "หายโศก",
            "postalCode": "31120"
          }
        ]
      },
      {
        "name": "ลำปลายมาศ",
        "subDistricts": [
          {
            "name": "ลำปลายมาศ",
            "postalCode": "31130"
          },
          {
            "name": "หนองคู",
            "postalCode": "31130"
          },
          {
            "name": "แสลงพัน",
            "postalCode": "31130"
          },
          {
            "name": "ทะเมนชัย",
            "postalCode": "31130"
          },
          {
            "name": "ตลาดโพธิ์",
            "postalCode": "31130"
          },
          {
            "name": "หนองกะทิง",
            "postalCode": "31130"
          },
          {
            "name": "โคกกลาง",
            "postalCode": "31130"
          },
          {
            "name": "โคกสะอาด",
            "postalCode": "31130"
          },
          {
            "name": "เมืองแฝก",
            "postalCode": "31130"
          },
          {
            "name": "บ้านยาง",
            "postalCode": "31130"
          },
          {
            "name": "ผไทรินทร์",
            "postalCode": "31130"
          },
          {
            "name": "โคกล่าม",
            "postalCode": "31130"
          },
          {
            "name": "หินโคน",
            "postalCode": "31130"
          },
          {
            "name": "หนองบัวโคก",
            "postalCode": "31130"
          },
          {
            "name": "บุโพธิ์",
            "postalCode": "31130"
          },
          {
            "name": "หนองโดน",
            "postalCode": "31130"
          }
        ]
      },
      {
        "name": "สตึก",
        "subDistricts": [
          {
            "name": "สตึก",
            "postalCode": "31150"
          },
          {
            "name": "นิคม",
            "postalCode": "31150"
          },
          {
            "name": "ทุ่งวัง",
            "postalCode": "31150"
          },
          {
            "name": "เมืองแก",
            "postalCode": "31150"
          },
          {
            "name": "หนองใหญ่",
            "postalCode": "31150"
          },
          {
            "name": "ร่อนทอง",
            "postalCode": "31150"
          },
          {
            "name": "ดอนมนต์",
            "postalCode": "31150"
          },
          {
            "name": "ชุมแสง",
            "postalCode": "31150"
          },
          {
            "name": "ท่าม่วง",
            "postalCode": "31150"
          },
          {
            "name": "สะแก",
            "postalCode": "31150"
          },
          {
            "name": "สนามชัย",
            "postalCode": "31150"
          },
          {
            "name": "กระสัง",
            "postalCode": "31150"
          }
        ]
      },
      {
        "name": "ปะคำ",
        "subDistricts": [
          {
            "name": "ปะคำ",
            "postalCode": "31220"
          },
          {
            "name": "ไทยเจริญ",
            "postalCode": "31220"
          },
          {
            "name": "หนองบัว",
            "postalCode": "31220"
          },
          {
            "name": "โคกมะม่วง",
            "postalCode": "31220"
          },
          {
            "name": "หูทำนบ",
            "postalCode": "31220"
          }
        ]
      },
      {
        "name": "นาโพธิ์",
        "subDistricts": [
          {
            "name": "นาโพธิ์",
            "postalCode": "31230"
          },
          {
            "name": "บ้านคู",
            "postalCode": "31230"
          },
          {
            "name": "บ้านดู่",
            "postalCode": "31230"
          },
          {
            "name": "ดอนกอก",
            "postalCode": "31230"
          },
          {
            "name": "ศรีสว่าง",
            "postalCode": "31230"
          }
        ]
      },
      {
        "name": "หนองหงส์",
        "subDistricts": [
          {
            "name": "สระแก้ว",
            "postalCode": "31240"
          },
          {
            "name": "ห้วยหิน",
            "postalCode": "31240"
          },
          {
            "name": "ไทยสามัคคี",
            "postalCode": "31240"
          },
          {
            "name": "หนองชัยศรี",
            "postalCode": "31240"
          },
          {
            "name": "เสาเดียว",
            "postalCode": "31240"
          },
          {
            "name": "เมืองฝ้าย",
            "postalCode": "31240"
          },
          {
            "name": "สระทอง",
            "postalCode": "31240"
          }
        ]
      },
      {
        "name": "พลับพลาชัย",
        "subDistricts": [
          {
            "name": "จันดุม",
            "postalCode": "31250"
          },
          {
            "name": "โคกขมิ้น",
            "postalCode": "31250"
          },
          {
            "name": "ป่าชัน",
            "postalCode": "31250"
          },
          {
            "name": "สะเดา",
            "postalCode": "31250"
          },
          {
            "name": "สำโรง",
            "postalCode": "31250"
          }
        ]
      },
      {
        "name": "ห้วยราช",
        "subDistricts": [
          {
            "name": "ห้วยราช",
            "postalCode": "31000"
          },
          {
            "name": "สามแวง",
            "postalCode": "31000"
          },
          {
            "name": "ตาเสา",
            "postalCode": "31000"
          },
          {
            "name": "บ้านตะโก",
            "postalCode": "31000"
          },
          {
            "name": "สนวน",
            "postalCode": "31000"
          },
          {
            "name": "โคกเหล็ก",
            "postalCode": "31000"
          },
          {
            "name": "เมืองโพธิ์",
            "postalCode": "31000"
          },
          {
            "name": "ห้วยราชา",
            "postalCode": "31000"
          }
        ]
      },
      {
        "name": "โนนสุวรรณ",
        "subDistricts": [
          {
            "name": "โนนสุวรรณ",
            "postalCode": "31110"
          },
          {
            "name": "ทุ่งจังหัน",
            "postalCode": "31110"
          },
          {
            "name": "โกรกแก้ว",
            "postalCode": "31110"
          },
          {
            "name": "ดงอีจาน",
            "postalCode": "31110"
          }
        ]
      },
      {
        "name": "ชำนิ",
        "subDistricts": [
          {
            "name": "ชำนิ",
            "postalCode": "31110"
          },
          {
            "name": "หนองปล่อง",
            "postalCode": "31110"
          },
          {
            "name": "เมืองยาง",
            "postalCode": "31110"
          },
          {
            "name": "ช่อผกา",
            "postalCode": "31110"
          },
          {
            "name": "ละลวด",
            "postalCode": "31110"
          },
          {
            "name": "โคกสนวน",
            "postalCode": "31110"
          }
        ]
      },
      {
        "name": "บ้านใหม่ไชยพจน์",
        "subDistricts": [
          {
            "name": "หนองแวง",
            "postalCode": "31120"
          },
          {
            "name": "ทองหลาง",
            "postalCode": "31120"
          },
          {
            "name": "แดงใหญ่",
            "postalCode": "31120"
          },
          {
            "name": "กู่สวนแตง",
            "postalCode": "31120"
          },
          {
            "name": "หนองเยือง",
            "postalCode": "31120"
          }
        ]
      },
      {
        "name": "โนนดินแดง",
        "subDistricts": [
          {
            "name": "โนนดินแดง",
            "postalCode": "31260"
          },
          {
            "name": "ส้มป่อย",
            "postalCode": "31260"
          },
          {
            "name": "ลำนางรอง",
            "postalCode": "31260"
          }
        ]
      },
      {
        "name": "บ้านด่าน",
        "subDistricts": [
          {
            "name": "บ้านด่าน",
            "postalCode": "31000"
          },
          {
            "name": "ปราสาท",
            "postalCode": "31000"
          },
          {
            "name": "วังเหนือ",
            "postalCode": "31000"
          },
          {
            "name": "โนนขวาง",
            "postalCode": "31000"
          }
        ]
      },
      {
        "name": "แคนดง",
        "subDistricts": [
          {
            "name": "แคนดง",
            "postalCode": "31150"
          },
          {
            "name": "ดงพลอง",
            "postalCode": "31150"
          },
          {
            "name": "สระบัว",
            "postalCode": "31150"
          },
          {
            "name": "หัวฝาย",
            "postalCode": "31150"
          }
        ]
      },
      {
        "name": "เฉลิมพระเกียรติ",
        "subDistricts": [
          {
            "name": "เจริญสุข",
            "postalCode": "31110"
          },
          {
            "name": "ตาเป๊ก",
            "postalCode": "31110"
          },
          {
            "name": "อีสานเขต",
            "postalCode": "31110"
          },
          {
            "name": "ถาวร",
            "postalCode": "31170"
          },
          {
            "name": "ยายแย้มวัฒนา",
            "postalCode": "31170"
          }
        ]
      }
    ]
  },
  {
    "name": "สุรินทร์",
    "districts": [
      {
        "name": "เมืองสุรินทร์",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "32000"
          },
          {
            "name": "ตั้งใจ",
            "postalCode": "32000"
          },
          {
            "name": "เพี้ยราม",
            "postalCode": "32000"
          },
          {
            "name": "นาดี",
            "postalCode": "32000"
          },
          {
            "name": "ท่าสว่าง",
            "postalCode": "32000"
          },
          {
            "name": "สลักได",
            "postalCode": "32000"
          },
          {
            "name": "ตาอ็อง",
            "postalCode": "32000"
          },
          {
            "name": "สำโรง",
            "postalCode": "32000"
          },
          {
            "name": "แกใหญ่",
            "postalCode": "32000"
          },
          {
            "name": "นอกเมือง",
            "postalCode": "32000"
          },
          {
            "name": "คอโค",
            "postalCode": "32000"
          },
          {
            "name": "สวาย",
            "postalCode": "32000"
          },
          {
            "name": "เฉนียง",
            "postalCode": "32000"
          },
          {
            "name": "เทนมีย์",
            "postalCode": "32000"
          },
          {
            "name": "นาบัว",
            "postalCode": "32000"
          },
          {
            "name": "เมืองที",
            "postalCode": "32000"
          },
          {
            "name": "ราม",
            "postalCode": "32000"
          },
          {
            "name": "บุฤาษี",
            "postalCode": "32000"
          },
          {
            "name": "ตระแสง",
            "postalCode": "32000"
          },
          {
            "name": "แสลงพันธ์",
            "postalCode": "32000"
          },
          {
            "name": "กาเกาะ",
            "postalCode": "32000"
          }
        ]
      },
      {
        "name": "ชุมพลบุรี",
        "subDistricts": [
          {
            "name": "ชุมพลบุรี",
            "postalCode": "32190"
          },
          {
            "name": "นาหนองไผ่",
            "postalCode": "32190"
          },
          {
            "name": "ไพรขลา",
            "postalCode": "32190"
          },
          {
            "name": "ศรีณรงค์",
            "postalCode": "32190"
          },
          {
            "name": "ยะวึก",
            "postalCode": "32190"
          },
          {
            "name": "เมืองบัว",
            "postalCode": "32190"
          },
          {
            "name": "สระขุด",
            "postalCode": "32190"
          },
          {
            "name": "กระเบื้อง",
            "postalCode": "32190"
          },
          {
            "name": "หนองเรือ",
            "postalCode": "32190"
          }
        ]
      },
      {
        "name": "ท่าตูม",
        "subDistricts": [
          {
            "name": "ท่าตูม",
            "postalCode": "32120"
          },
          {
            "name": "กระโพ",
            "postalCode": "32120"
          },
          {
            "name": "พรมเทพ",
            "postalCode": "32120"
          },
          {
            "name": "โพนครก",
            "postalCode": "32120"
          },
          {
            "name": "เมืองแก",
            "postalCode": "32120"
          },
          {
            "name": "บะ",
            "postalCode": "32120"
          },
          {
            "name": "หนองบัว",
            "postalCode": "32120"
          },
          {
            "name": "บัวโคก",
            "postalCode": "32120"
          },
          {
            "name": "หนองเมธี",
            "postalCode": "32120"
          },
          {
            "name": "ทุ่งกุลา",
            "postalCode": "32120"
          }
        ]
      },
      {
        "name": "จอมพระ",
        "subDistricts": [
          {
            "name": "จอมพระ",
            "postalCode": "32180"
          },
          {
            "name": "เมืองลีง",
            "postalCode": "32180"
          },
          {
            "name": "กระหาด",
            "postalCode": "32180"
          },
          {
            "name": "บุแกรง",
            "postalCode": "32180"
          },
          {
            "name": "หนองสนิท",
            "postalCode": "32180"
          },
          {
            "name": "บ้านผือ",
            "postalCode": "32180"
          },
          {
            "name": "ลุ่มระวี",
            "postalCode": "32180"
          },
          {
            "name": "ชุมแสง",
            "postalCode": "32180"
          },
          {
            "name": "เป็นสุข",
            "postalCode": "32180"
          }
        ]
      },
      {
        "name": "ปราสาท",
        "subDistricts": [
          {
            "name": "กังแอน",
            "postalCode": "32140"
          },
          {
            "name": "ทมอ",
            "postalCode": "32140"
          },
          {
            "name": "ไพล",
            "postalCode": "32140"
          },
          {
            "name": "ปรือ",
            "postalCode": "32140"
          },
          {
            "name": "ทุ่งมน",
            "postalCode": "32140"
          },
          {
            "name": "ตาเบา",
            "postalCode": "32140"
          },
          {
            "name": "หนองใหญ่",
            "postalCode": "32140"
          },
          {
            "name": "โคกยาง",
            "postalCode": "32140"
          },
          {
            "name": "โคกสะอาด",
            "postalCode": "32140"
          },
          {
            "name": "บ้านไทร",
            "postalCode": "32140"
          },
          {
            "name": "โชคนาสาม",
            "postalCode": "32140"
          },
          {
            "name": "เชื้อเพลิง",
            "postalCode": "32140"
          },
          {
            "name": "ปราสาททนง",
            "postalCode": "32140"
          },
          {
            "name": "ตานี",
            "postalCode": "32140"
          },
          {
            "name": "บ้านพลวง",
            "postalCode": "32140"
          },
          {
            "name": "กันตวจระมวล",
            "postalCode": "32140"
          },
          {
            "name": "สมุด",
            "postalCode": "32140"
          },
          {
            "name": "ประทัดบุ",
            "postalCode": "32140"
          }
        ]
      },
      {
        "name": "กาบเชิง",
        "subDistricts": [
          {
            "name": "กาบเชิง",
            "postalCode": "32210"
          },
          {
            "name": "คูตัน",
            "postalCode": "32210"
          },
          {
            "name": "ด่าน",
            "postalCode": "32210"
          },
          {
            "name": "แนงมุด",
            "postalCode": "32210"
          },
          {
            "name": "โคกตะเคียน",
            "postalCode": "32210"
          },
          {
            "name": "ตะเคียน",
            "postalCode": "32210"
          }
        ]
      },
      {
        "name": "รัตนบุรี",
        "subDistricts": [
          {
            "name": "รัตนบุรี",
            "postalCode": "32130"
          },
          {
            "name": "ธาตุ",
            "postalCode": "32130"
          },
          {
            "name": "แก",
            "postalCode": "32130"
          },
          {
            "name": "ดอนแรด",
            "postalCode": "32130"
          },
          {
            "name": "หนองบัวทอง",
            "postalCode": "32130"
          },
          {
            "name": "หนองบัวบาน",
            "postalCode": "32130"
          },
          {
            "name": "ไผ่",
            "postalCode": "32130"
          },
          {
            "name": "เบิด",
            "postalCode": "32130"
          },
          {
            "name": "น้ำเขียว",
            "postalCode": "32130"
          },
          {
            "name": "กุดขาคีม",
            "postalCode": "32130"
          },
          {
            "name": "ยางสว่าง",
            "postalCode": "32130"
          },
          {
            "name": "ทับใหญ่",
            "postalCode": "32130"
          }
        ]
      },
      {
        "name": "สนม",
        "subDistricts": [
          {
            "name": "สนม",
            "postalCode": "32160"
          },
          {
            "name": "โพนโก",
            "postalCode": "32160"
          },
          {
            "name": "หนองระฆัง",
            "postalCode": "32160"
          },
          {
            "name": "นานวน",
            "postalCode": "32160"
          },
          {
            "name": "แคน",
            "postalCode": "32160"
          },
          {
            "name": "หัวงัว",
            "postalCode": "32160"
          },
          {
            "name": "หนองอียอ",
            "postalCode": "32160"
          }
        ]
      },
      {
        "name": "ศีขรภูมิ",
        "subDistricts": [
          {
            "name": "ระแงง",
            "postalCode": "32110"
          },
          {
            "name": "ตรึม",
            "postalCode": "32110"
          },
          {
            "name": "จารพัต",
            "postalCode": "32110"
          },
          {
            "name": "ยาง",
            "postalCode": "32110"
          },
          {
            "name": "แตล",
            "postalCode": "32110"
          },
          {
            "name": "หนองบัว",
            "postalCode": "32110"
          },
          {
            "name": "คาละแมะ",
            "postalCode": "32110"
          },
          {
            "name": "หนองเหล็ก",
            "postalCode": "32110"
          },
          {
            "name": "หนองขวาว",
            "postalCode": "32110"
          },
          {
            "name": "ช่างปี่",
            "postalCode": "32110"
          },
          {
            "name": "กุดหวาย",
            "postalCode": "32110"
          },
          {
            "name": "ขวาวใหญ่",
            "postalCode": "32110"
          },
          {
            "name": "นารุ่ง",
            "postalCode": "32110"
          },
          {
            "name": "ตรมไพร",
            "postalCode": "32110"
          },
          {
            "name": "ผักไหม",
            "postalCode": "32110"
          }
        ]
      },
      {
        "name": "สังขะ",
        "subDistricts": [
          {
            "name": "สังขะ",
            "postalCode": "32150"
          },
          {
            "name": "ขอนแตก",
            "postalCode": "32150"
          },
          {
            "name": "ดม",
            "postalCode": "32150"
          },
          {
            "name": "พระแก้ว",
            "postalCode": "32150"
          },
          {
            "name": "บ้านจารย์",
            "postalCode": "32150"
          },
          {
            "name": "กระเทียม",
            "postalCode": "32150"
          },
          {
            "name": "สะกาด",
            "postalCode": "32150"
          },
          {
            "name": "ตาตุม",
            "postalCode": "32150"
          },
          {
            "name": "ทับทัน",
            "postalCode": "32150"
          },
          {
            "name": "ตาคง",
            "postalCode": "32150"
          },
          {
            "name": "บ้านชบ",
            "postalCode": "32150"
          },
          {
            "name": "เทพรักษา",
            "postalCode": "32150"
          }
        ]
      },
      {
        "name": "ลำดวน",
        "subDistricts": [
          {
            "name": "ลำดวน",
            "postalCode": "32220"
          },
          {
            "name": "โชคเหนือ",
            "postalCode": "32220"
          },
          {
            "name": "อู่โลก",
            "postalCode": "32220"
          },
          {
            "name": "ตรำดม",
            "postalCode": "32220"
          },
          {
            "name": "ตระเปียงเตีย",
            "postalCode": "32220"
          }
        ]
      },
      {
        "name": "สำโรงทาบ",
        "subDistricts": [
          {
            "name": "สำโรงทาบ",
            "postalCode": "32170"
          },
          {
            "name": "หนองไผ่ล้อม",
            "postalCode": "32170"
          },
          {
            "name": "กระออม",
            "postalCode": "32170"
          },
          {
            "name": "หนองฮะ",
            "postalCode": "32170"
          },
          {
            "name": "ศรีสุข",
            "postalCode": "32170"
          },
          {
            "name": "เกาะแก้ว",
            "postalCode": "32170"
          },
          {
            "name": "หมื่นศรี",
            "postalCode": "32170"
          },
          {
            "name": "เสม็จ",
            "postalCode": "32170"
          },
          {
            "name": "สะโน",
            "postalCode": "32170"
          },
          {
            "name": "ประดู่",
            "postalCode": "32170"
          }
        ]
      },
      {
        "name": "บัวเชด",
        "subDistricts": [
          {
            "name": "บัวเชด",
            "postalCode": "32230"
          },
          {
            "name": "สะเดา",
            "postalCode": "32230"
          },
          {
            "name": "จรัส",
            "postalCode": "32230"
          },
          {
            "name": "ตาวัง",
            "postalCode": "32230"
          },
          {
            "name": "อาโพน",
            "postalCode": "32230"
          },
          {
            "name": "สำเภาลูน",
            "postalCode": "32230"
          }
        ]
      },
      {
        "name": "พนมดงรัก",
        "subDistricts": [
          {
            "name": "บักได",
            "postalCode": "32140"
          },
          {
            "name": "โคกกลาง",
            "postalCode": "32140"
          },
          {
            "name": "จีกแดก",
            "postalCode": "32140"
          },
          {
            "name": "ตาเมียง",
            "postalCode": "32140"
          }
        ]
      },
      {
        "name": "ศรีณรงค์",
        "subDistricts": [
          {
            "name": "ณรงค์",
            "postalCode": "32150"
          },
          {
            "name": "แจนแวน",
            "postalCode": "32150"
          },
          {
            "name": "ตรวจ",
            "postalCode": "32150"
          },
          {
            "name": "หนองแวง",
            "postalCode": "32150"
          },
          {
            "name": "ศรีสุข",
            "postalCode": "32150"
          }
        ]
      },
      {
        "name": "เขวาสินรินทร์",
        "subDistricts": [
          {
            "name": "เขวาสินรินทร์",
            "postalCode": "32000"
          },
          {
            "name": "บึง",
            "postalCode": "32000"
          },
          {
            "name": "ตากูก",
            "postalCode": "32000"
          },
          {
            "name": "ปราสาททอง",
            "postalCode": "32000"
          },
          {
            "name": "บ้านแร่",
            "postalCode": "32000"
          }
        ]
      },
      {
        "name": "โนนนารายณ์",
        "subDistricts": [
          {
            "name": "หนองหลวง",
            "postalCode": "32130"
          },
          {
            "name": "คำผง",
            "postalCode": "32130"
          },
          {
            "name": "โนน",
            "postalCode": "32130"
          },
          {
            "name": "ระเวียง",
            "postalCode": "32130"
          },
          {
            "name": "หนองเทพ",
            "postalCode": "32130"
          }
        ]
      }
    ]
  },
  {
    "name": "ศรีสะเกษ",
    "districts": [
      {
        "name": "เมืองศรีสะเกษ",
        "subDistricts": [
          {
            "name": "เมืองเหนือ",
            "postalCode": "33000"
          },
          {
            "name": "เมืองใต้",
            "postalCode": "33000"
          },
          {
            "name": "คูซอด",
            "postalCode": "33000"
          },
          {
            "name": "ซำ",
            "postalCode": "33000"
          },
          {
            "name": "จาน",
            "postalCode": "33000"
          },
          {
            "name": "ตะดอบ",
            "postalCode": "33000"
          },
          {
            "name": "หนองครก",
            "postalCode": "33000"
          },
          {
            "name": "โพนข่า",
            "postalCode": "33000"
          },
          {
            "name": "โพนค้อ",
            "postalCode": "33000"
          },
          {
            "name": "โพนเขวา",
            "postalCode": "33000"
          },
          {
            "name": "หญ้าปล้อง",
            "postalCode": "33000"
          },
          {
            "name": "ทุ่ม",
            "postalCode": "33000"
          },
          {
            "name": "หนองไฮ",
            "postalCode": "33000"
          },
          {
            "name": "หนองแก้ว",
            "postalCode": "33000"
          },
          {
            "name": "น้ำคำ",
            "postalCode": "33000"
          },
          {
            "name": "โพธิ์",
            "postalCode": "33000"
          },
          {
            "name": "หมากเขียบ",
            "postalCode": "33000"
          },
          {
            "name": "หนองไผ่",
            "postalCode": "33000"
          }
        ]
      },
      {
        "name": "ยางชุมน้อย",
        "subDistricts": [
          {
            "name": "ยางชุมน้อย",
            "postalCode": "33190"
          },
          {
            "name": "ลิ้นฟ้า",
            "postalCode": "33190"
          },
          {
            "name": "คอนกาม",
            "postalCode": "33190"
          },
          {
            "name": "โนนคูณ",
            "postalCode": "33190"
          },
          {
            "name": "กุดเมืองฮาม",
            "postalCode": "33190"
          },
          {
            "name": "บึงบอน",
            "postalCode": "33190"
          },
          {
            "name": "ยางชุมใหญ่",
            "postalCode": "33190"
          }
        ]
      },
      {
        "name": "กันทรารมย์",
        "subDistricts": [
          {
            "name": "ดูน",
            "postalCode": "33130"
          },
          {
            "name": "โนนสัง",
            "postalCode": "33130"
          },
          {
            "name": "หนองหัวช้าง",
            "postalCode": "33130"
          },
          {
            "name": "ยาง",
            "postalCode": "33130"
          },
          {
            "name": "หนองแวง",
            "postalCode": "33130"
          },
          {
            "name": "หนองแก้ว",
            "postalCode": "33130"
          },
          {
            "name": "ทาม",
            "postalCode": "33130"
          },
          {
            "name": "ละทาย",
            "postalCode": "33130"
          },
          {
            "name": "เมืองน้อย",
            "postalCode": "33130"
          },
          {
            "name": "อีปาด",
            "postalCode": "33130"
          },
          {
            "name": "บัวน้อย",
            "postalCode": "33130"
          },
          {
            "name": "หนองบัว",
            "postalCode": "33130"
          },
          {
            "name": "ดู่",
            "postalCode": "33130"
          },
          {
            "name": "ผักแพว",
            "postalCode": "33130"
          },
          {
            "name": "จาน",
            "postalCode": "33130"
          },
          {
            "name": "คำเนียม",
            "postalCode": "33130"
          }
        ]
      },
      {
        "name": "กันทรลักษ์",
        "subDistricts": [
          {
            "name": "บึงมะลู",
            "postalCode": "33110"
          },
          {
            "name": "กุดเสลา",
            "postalCode": "33110"
          },
          {
            "name": "เมือง",
            "postalCode": "33110"
          },
          {
            "name": "สังเม็ก",
            "postalCode": "33110"
          },
          {
            "name": "น้ำอ้อม",
            "postalCode": "33110"
          },
          {
            "name": "ละลาย",
            "postalCode": "33110"
          },
          {
            "name": "รุง",
            "postalCode": "33110"
          },
          {
            "name": "ตระกาจ",
            "postalCode": "33110"
          },
          {
            "name": "จานใหญ่",
            "postalCode": "33110"
          },
          {
            "name": "ภูเงิน",
            "postalCode": "33110"
          },
          {
            "name": "ชำ",
            "postalCode": "33110"
          },
          {
            "name": "กระแชง",
            "postalCode": "33110"
          },
          {
            "name": "โนนสำราญ",
            "postalCode": "33110"
          },
          {
            "name": "หนองหญ้าลาด",
            "postalCode": "33110"
          },
          {
            "name": "เสาธงชัย",
            "postalCode": "33110"
          },
          {
            "name": "ขนุน",
            "postalCode": "33110"
          },
          {
            "name": "สวนกล้วย",
            "postalCode": "33110"
          },
          {
            "name": "เวียงเหนือ",
            "postalCode": "33110"
          },
          {
            "name": "ทุ่งใหญ่",
            "postalCode": "33110"
          },
          {
            "name": "ภูผาหมอก",
            "postalCode": "33110"
          }
        ]
      },
      {
        "name": "ขุขันธ์",
        "subDistricts": [
          {
            "name": "กันทรารมย์",
            "postalCode": "33140"
          },
          {
            "name": "จะกง",
            "postalCode": "33140"
          },
          {
            "name": "ใจดี",
            "postalCode": "33140"
          },
          {
            "name": "ดองกำเม็ด",
            "postalCode": "33140"
          },
          {
            "name": "โสน",
            "postalCode": "33140"
          },
          {
            "name": "ปรือใหญ่",
            "postalCode": "33140"
          },
          {
            "name": "สะเดาใหญ่",
            "postalCode": "33140"
          },
          {
            "name": "ตาอุด",
            "postalCode": "33140"
          },
          {
            "name": "ห้วยเหนือ",
            "postalCode": "33140"
          },
          {
            "name": "ห้วยใต้",
            "postalCode": "33140"
          },
          {
            "name": "หัวเสือ",
            "postalCode": "33140"
          },
          {
            "name": "ตะเคียน",
            "postalCode": "33140"
          },
          {
            "name": "นิคมพัฒนา",
            "postalCode": "33140"
          },
          {
            "name": "โคกเพชร",
            "postalCode": "33140"
          },
          {
            "name": "ปราสาท",
            "postalCode": "33140"
          },
          {
            "name": "สำโรงตาเจ็น",
            "postalCode": "33140"
          },
          {
            "name": "ห้วยสำราญ",
            "postalCode": "33140"
          },
          {
            "name": "กฤษณา",
            "postalCode": "33140"
          },
          {
            "name": "ลมศักดิ์",
            "postalCode": "33140"
          },
          {
            "name": "หนองฉลอง",
            "postalCode": "33140"
          },
          {
            "name": "ศรีตระกูล",
            "postalCode": "33140"
          },
          {
            "name": "ศรีสะอาด",
            "postalCode": "33140"
          }
        ]
      },
      {
        "name": "ไพรบึง",
        "subDistricts": [
          {
            "name": "ไพรบึง",
            "postalCode": "33180"
          },
          {
            "name": "ดินแดง",
            "postalCode": "33180"
          },
          {
            "name": "ปราสาทเยอ",
            "postalCode": "33180"
          },
          {
            "name": "สำโรงพลัน",
            "postalCode": "33180"
          },
          {
            "name": "สุขสวัสดิ์",
            "postalCode": "33180"
          },
          {
            "name": "โนนปูน",
            "postalCode": "33180"
          }
        ]
      },
      {
        "name": "ปรางค์กู่",
        "subDistricts": [
          {
            "name": "พิมาย",
            "postalCode": "33170"
          },
          {
            "name": "กู่",
            "postalCode": "33170"
          },
          {
            "name": "หนองเชียงทูน",
            "postalCode": "33170"
          },
          {
            "name": "ตูม",
            "postalCode": "33170"
          },
          {
            "name": "สมอ",
            "postalCode": "33170"
          },
          {
            "name": "โพธิ์ศรี",
            "postalCode": "33170"
          },
          {
            "name": "สำโรงปราสาท",
            "postalCode": "33170"
          },
          {
            "name": "ดู่",
            "postalCode": "33170"
          },
          {
            "name": "สวาย",
            "postalCode": "33170"
          },
          {
            "name": "พิมายเหนือ",
            "postalCode": "33170"
          }
        ]
      },
      {
        "name": "ขุนหาญ",
        "subDistricts": [
          {
            "name": "สิ",
            "postalCode": "33150"
          },
          {
            "name": "บักดอง",
            "postalCode": "33150"
          },
          {
            "name": "พราน",
            "postalCode": "33150"
          },
          {
            "name": "โพธิ์วงศ์",
            "postalCode": "33150"
          },
          {
            "name": "ไพร",
            "postalCode": "33150"
          },
          {
            "name": "กระหวัน",
            "postalCode": "33150"
          },
          {
            "name": "ขุนหาญ",
            "postalCode": "33150"
          },
          {
            "name": "โนนสูง",
            "postalCode": "33150"
          },
          {
            "name": "กันทรอม",
            "postalCode": "33150"
          },
          {
            "name": "ภูฝ้าย",
            "postalCode": "33150"
          },
          {
            "name": "โพธิ์กระสังข์",
            "postalCode": "33150"
          },
          {
            "name": "ห้วยจันทร์",
            "postalCode": "33150"
          }
        ]
      },
      {
        "name": "ราษีไศล",
        "subDistricts": [
          {
            "name": "เมืองคง",
            "postalCode": "33160"
          },
          {
            "name": "เมืองแคน",
            "postalCode": "33160"
          },
          {
            "name": "หนองแค",
            "postalCode": "33160"
          },
          {
            "name": "จิกสังข์ทอง",
            "postalCode": "33160"
          },
          {
            "name": "ด่าน",
            "postalCode": "33160"
          },
          {
            "name": "ดู่",
            "postalCode": "33160"
          },
          {
            "name": "หนองอึ่ง",
            "postalCode": "33160"
          },
          {
            "name": "บัวหุ่ง",
            "postalCode": "33160"
          },
          {
            "name": "ไผ่",
            "postalCode": "33160"
          },
          {
            "name": "ส้มป่อย",
            "postalCode": "33160"
          },
          {
            "name": "หนองหมี",
            "postalCode": "33160"
          },
          {
            "name": "หว้านคำ",
            "postalCode": "33160"
          },
          {
            "name": "สร้างปี่",
            "postalCode": "33160"
          }
        ]
      },
      {
        "name": "อุทุมพรพิสัย",
        "subDistricts": [
          {
            "name": "กำแพง",
            "postalCode": "33120"
          },
          {
            "name": "อี่หล่ำ",
            "postalCode": "33120"
          },
          {
            "name": "ก้านเหลือง",
            "postalCode": "33120"
          },
          {
            "name": "ทุ่งไชย",
            "postalCode": "33120"
          },
          {
            "name": "สำโรง",
            "postalCode": "33120"
          },
          {
            "name": "แขม",
            "postalCode": "33120"
          },
          {
            "name": "หนองไฮ",
            "postalCode": "33120"
          },
          {
            "name": "ขะยูง",
            "postalCode": "33120"
          },
          {
            "name": "ตาเกษ",
            "postalCode": "33120"
          },
          {
            "name": "หัวช้าง",
            "postalCode": "33120"
          },
          {
            "name": "รังแร้ง",
            "postalCode": "33120"
          },
          {
            "name": "แต้",
            "postalCode": "33120"
          },
          {
            "name": "แข้",
            "postalCode": "33120"
          },
          {
            "name": "โพธิ์ชัย",
            "postalCode": "33120"
          },
          {
            "name": "ปะอาว",
            "postalCode": "33120"
          },
          {
            "name": "หนองห้าง",
            "postalCode": "33120"
          },
          {
            "name": "สระกำแพงใหญ่",
            "postalCode": "33120"
          },
          {
            "name": "โคกหล่าม",
            "postalCode": "33120"
          },
          {
            "name": "โคกจาน",
            "postalCode": "33120"
          }
        ]
      },
      {
        "name": "บึงบูรพ์",
        "subDistricts": [
          {
            "name": "เป๊าะ",
            "postalCode": "33220"
          },
          {
            "name": "บึงบูรพ์",
            "postalCode": "33220"
          }
        ]
      },
      {
        "name": "ห้วยทับทัน",
        "subDistricts": [
          {
            "name": "ห้วยทับทัน",
            "postalCode": "33210"
          },
          {
            "name": "เมืองหลวง",
            "postalCode": "33210"
          },
          {
            "name": "กล้วยกว้าง",
            "postalCode": "33210"
          },
          {
            "name": "ผักไหม",
            "postalCode": "33210"
          },
          {
            "name": "จานแสนไชย",
            "postalCode": "33210"
          },
          {
            "name": "ปราสาท",
            "postalCode": "33210"
          }
        ]
      },
      {
        "name": "โนนคูณ",
        "subDistricts": [
          {
            "name": "โนนค้อ",
            "postalCode": "33250"
          },
          {
            "name": "บก",
            "postalCode": "33250"
          },
          {
            "name": "โพธิ์",
            "postalCode": "33250"
          },
          {
            "name": "หนองกุง",
            "postalCode": "33250"
          },
          {
            "name": "เหล่ากวาง",
            "postalCode": "33250"
          }
        ]
      },
      {
        "name": "ศรีรัตนะ",
        "subDistricts": [
          {
            "name": "ศรีแก้ว",
            "postalCode": "33240"
          },
          {
            "name": "พิงพวย",
            "postalCode": "33240"
          },
          {
            "name": "สระเยาว์",
            "postalCode": "33240"
          },
          {
            "name": "ตูม",
            "postalCode": "33240"
          },
          {
            "name": "เสื่องข้าว",
            "postalCode": "33240"
          },
          {
            "name": "ศรีโนนงาม",
            "postalCode": "33240"
          },
          {
            "name": "สะพุง",
            "postalCode": "33240"
          }
        ]
      },
      {
        "name": "น้ำเกลี้ยง",
        "subDistricts": [
          {
            "name": "น้ำเกลี้ยง",
            "postalCode": "33130"
          },
          {
            "name": "ละเอาะ",
            "postalCode": "33130"
          },
          {
            "name": "ตองปิด",
            "postalCode": "33130"
          },
          {
            "name": "เขิน",
            "postalCode": "33130"
          },
          {
            "name": "รุ่งระวี",
            "postalCode": "33130"
          },
          {
            "name": "คูบ",
            "postalCode": "33130"
          }
        ]
      },
      {
        "name": "วังหิน",
        "subDistricts": [
          {
            "name": "บุสูง",
            "postalCode": "33270"
          },
          {
            "name": "ธาตุ",
            "postalCode": "33270"
          },
          {
            "name": "ดวนใหญ่",
            "postalCode": "33270"
          },
          {
            "name": "บ่อแก้ว",
            "postalCode": "33270"
          },
          {
            "name": "ศรีสำราญ",
            "postalCode": "33270"
          },
          {
            "name": "ทุ่งสว่าง",
            "postalCode": "33270"
          },
          {
            "name": "วังหิน",
            "postalCode": "33270"
          },
          {
            "name": "โพนยาง",
            "postalCode": "33270"
          }
        ]
      },
      {
        "name": "ภูสิงห์",
        "subDistricts": [
          {
            "name": "โคกตาล",
            "postalCode": "33140"
          },
          {
            "name": "ห้วยตามอญ",
            "postalCode": "33140"
          },
          {
            "name": "ห้วยตึ๊กชู",
            "postalCode": "33140"
          },
          {
            "name": "ละลม",
            "postalCode": "33140"
          },
          {
            "name": "ตะเคียนราม",
            "postalCode": "33140"
          },
          {
            "name": "ดงรัก",
            "postalCode": "33140"
          },
          {
            "name": "ไพรพัฒนา",
            "postalCode": "33140"
          }
        ]
      },
      {
        "name": "เมืองจันทร์",
        "subDistricts": [
          {
            "name": "เมืองจันทร์",
            "postalCode": "33120"
          },
          {
            "name": "ตาโกน",
            "postalCode": "33120"
          },
          {
            "name": "หนองใหญ่",
            "postalCode": "33120"
          }
        ]
      },
      {
        "name": "เบญจลักษ์",
        "subDistricts": [
          {
            "name": "เสียว",
            "postalCode": "33110"
          },
          {
            "name": "หนองหว้า",
            "postalCode": "33110"
          },
          {
            "name": "หนองงูเหลือม",
            "postalCode": "33110"
          },
          {
            "name": "หนองฮาง",
            "postalCode": "33110"
          },
          {
            "name": "ท่าคล้อ",
            "postalCode": "33110"
          }
        ]
      },
      {
        "name": "พยุห์",
        "subDistricts": [
          {
            "name": "พยุห์",
            "postalCode": "33230"
          },
          {
            "name": "พรหมสวัสดิ์",
            "postalCode": "33230"
          },
          {
            "name": "ตำแย",
            "postalCode": "33230"
          },
          {
            "name": "โนนเพ็ก",
            "postalCode": "33230"
          },
          {
            "name": "หนองค้า",
            "postalCode": "33230"
          }
        ]
      },
      {
        "name": "โพธิ์ศรีสุวรรณ",
        "subDistricts": [
          {
            "name": "โดด",
            "postalCode": "33120"
          },
          {
            "name": "เสียว",
            "postalCode": "33120"
          },
          {
            "name": "หนองม้า",
            "postalCode": "33120"
          },
          {
            "name": "ผือใหญ่",
            "postalCode": "33120"
          },
          {
            "name": "อีเซ",
            "postalCode": "33120"
          }
        ]
      },
      {
        "name": "ศิลาลาด",
        "subDistricts": [
          {
            "name": "กุง",
            "postalCode": "33160"
          },
          {
            "name": "คลีกลิ้ง",
            "postalCode": "33160"
          },
          {
            "name": "หนองบัวดง",
            "postalCode": "33160"
          },
          {
            "name": "โจดม่วง",
            "postalCode": "33160"
          }
        ]
      }
    ]
  },
  {
    "name": "อุบลราชธานี",
    "districts": [
      {
        "name": "เมืองอุบลราชธานี",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "34000"
          },
          {
            "name": "หัวเรือ",
            "postalCode": "34000"
          },
          {
            "name": "หนองขอน",
            "postalCode": "34000"
          },
          {
            "name": "ปทุม",
            "postalCode": "34000"
          },
          {
            "name": "ขามใหญ่",
            "postalCode": "34000"
          },
          {
            "name": "แจระแม",
            "postalCode": "34000"
          },
          {
            "name": "หนองบ่อ",
            "postalCode": "34000"
          },
          {
            "name": "ไร่น้อย",
            "postalCode": "34000"
          },
          {
            "name": "กระโสบ",
            "postalCode": "34000"
          },
          {
            "name": "กุดลาด",
            "postalCode": "34000"
          },
          {
            "name": "ขี้เหล็ก",
            "postalCode": "34000"
          },
          {
            "name": "ปะอาว",
            "postalCode": "34000"
          }
        ]
      },
      {
        "name": "ศรีเมืองใหม่",
        "subDistricts": [
          {
            "name": "นาคำ",
            "postalCode": "34250"
          },
          {
            "name": "แก้งกอก",
            "postalCode": "34250"
          },
          {
            "name": "เอือดใหญ่",
            "postalCode": "34250"
          },
          {
            "name": "วาริน",
            "postalCode": "34250"
          },
          {
            "name": "ลาดควาย",
            "postalCode": "34250"
          },
          {
            "name": "สงยาง",
            "postalCode": "34250"
          },
          {
            "name": "ตะบ่าย",
            "postalCode": "34250"
          },
          {
            "name": "คำไหล",
            "postalCode": "34250"
          },
          {
            "name": "หนามแท่ง",
            "postalCode": "34250"
          },
          {
            "name": "นาเลิน",
            "postalCode": "34250"
          },
          {
            "name": "ดอนใหญ่",
            "postalCode": "34250"
          }
        ]
      },
      {
        "name": "โขงเจียม",
        "subDistricts": [
          {
            "name": "โขงเจียม",
            "postalCode": "34220"
          },
          {
            "name": "ห้วยยาง",
            "postalCode": "34220"
          },
          {
            "name": "นาโพธิ์กลาง",
            "postalCode": "34220"
          },
          {
            "name": "หนองแสงใหญ่",
            "postalCode": "34220"
          },
          {
            "name": "ห้วยไผ่",
            "postalCode": "34220"
          },
          {
            "name": "คำเขื่อนแก้ว",
            "postalCode": "34220"
          }
        ]
      },
      {
        "name": "เขื่องใน",
        "subDistricts": [
          {
            "name": "เขื่องใน",
            "postalCode": "34150"
          },
          {
            "name": "สร้างถ่อ",
            "postalCode": "34150"
          },
          {
            "name": "ค้อทอง",
            "postalCode": "34150"
          },
          {
            "name": "ก่อเอ้",
            "postalCode": "34150"
          },
          {
            "name": "หัวดอน",
            "postalCode": "34150"
          },
          {
            "name": "ชีทวน",
            "postalCode": "34150"
          },
          {
            "name": "ท่าไห",
            "postalCode": "34150"
          },
          {
            "name": "นาคำใหญ่",
            "postalCode": "34150"
          },
          {
            "name": "แดงหม้อ",
            "postalCode": "34150"
          },
          {
            "name": "ธาตุน้อย",
            "postalCode": "34150"
          },
          {
            "name": "บ้านไทย",
            "postalCode": "34320"
          },
          {
            "name": "บ้านกอก",
            "postalCode": "34320"
          },
          {
            "name": "กลางใหญ่",
            "postalCode": "34320"
          },
          {
            "name": "โนนรัง",
            "postalCode": "34320"
          },
          {
            "name": "ยางขี้นก",
            "postalCode": "34150"
          },
          {
            "name": "ศรีสุข",
            "postalCode": "34150"
          },
          {
            "name": "สหธาตุ",
            "postalCode": "34150"
          },
          {
            "name": "หนองเหล่า",
            "postalCode": "34150"
          }
        ]
      },
      {
        "name": "เขมราฐ",
        "subDistricts": [
          {
            "name": "เขมราฐ",
            "postalCode": "34170"
          },
          {
            "name": "ขามป้อม",
            "postalCode": "34170"
          },
          {
            "name": "เจียด",
            "postalCode": "34170"
          },
          {
            "name": "หนองผือ",
            "postalCode": "34170"
          },
          {
            "name": "นาแวง",
            "postalCode": "34170"
          },
          {
            "name": "แก้งเหนือ",
            "postalCode": "34170"
          },
          {
            "name": "หนองนกทา",
            "postalCode": "34170"
          },
          {
            "name": "หนองสิม",
            "postalCode": "34170"
          },
          {
            "name": "หัวนา",
            "postalCode": "34170"
          }
        ]
      },
      {
        "name": "เดชอุดม",
        "subDistricts": [
          {
            "name": "เมืองเดช",
            "postalCode": "34160"
          },
          {
            "name": "นาส่วง",
            "postalCode": "34160"
          },
          {
            "name": "นาเจริญ",
            "postalCode": "34160"
          },
          {
            "name": "ทุ่งเทิง",
            "postalCode": "34160"
          },
          {
            "name": "สมสะอาด",
            "postalCode": "34160"
          },
          {
            "name": "กุดประทาย",
            "postalCode": "34160"
          },
          {
            "name": "ตบหู",
            "postalCode": "34160"
          },
          {
            "name": "กลาง",
            "postalCode": "34160"
          },
          {
            "name": "แก้ง",
            "postalCode": "34160"
          },
          {
            "name": "ท่าโพธิ์ศรี",
            "postalCode": "34160"
          },
          {
            "name": "บัวงาม",
            "postalCode": "34160"
          },
          {
            "name": "คำครั่ง",
            "postalCode": "34160"
          },
          {
            "name": "นากระแซง",
            "postalCode": "34160"
          },
          {
            "name": "โพนงาม",
            "postalCode": "34160"
          },
          {
            "name": "ป่าโมง",
            "postalCode": "34160"
          },
          {
            "name": "โนนสมบูรณ์",
            "postalCode": "34160"
          }
        ]
      },
      {
        "name": "นาจะหลวย",
        "subDistricts": [
          {
            "name": "นาจะหลวย",
            "postalCode": "34280"
          },
          {
            "name": "โนนสมบูรณ์",
            "postalCode": "34280"
          },
          {
            "name": "พรสวรรค์",
            "postalCode": "34280"
          },
          {
            "name": "บ้านตูม",
            "postalCode": "34280"
          },
          {
            "name": "โสกแสง",
            "postalCode": "34280"
          },
          {
            "name": "โนนสวรรค์",
            "postalCode": "34280"
          }
        ]
      },
      {
        "name": "น้ำยืน",
        "subDistricts": [
          {
            "name": "โซง",
            "postalCode": "34260"
          },
          {
            "name": "ยาง",
            "postalCode": "34260"
          },
          {
            "name": "โดมประดิษฐ์",
            "postalCode": "34260"
          },
          {
            "name": "บุเปือย",
            "postalCode": "34260"
          },
          {
            "name": "สีวิเชียร",
            "postalCode": "34260"
          },
          {
            "name": "ยางใหญ่",
            "postalCode": "34260"
          },
          {
            "name": "เก่าขาม",
            "postalCode": "34260"
          }
        ]
      },
      {
        "name": "บุณฑริก",
        "subDistricts": [
          {
            "name": "โพนงาม",
            "postalCode": "34230"
          },
          {
            "name": "ห้วยข่า",
            "postalCode": "34230"
          },
          {
            "name": "คอแลน",
            "postalCode": "34230"
          },
          {
            "name": "นาโพธิ์",
            "postalCode": "34230"
          },
          {
            "name": "หนองสะโน",
            "postalCode": "34230"
          },
          {
            "name": "โนนค้อ",
            "postalCode": "34230"
          },
          {
            "name": "บัวงาม",
            "postalCode": "34230"
          },
          {
            "name": "บ้านแมด",
            "postalCode": "34230"
          }
        ]
      },
      {
        "name": "ตระการพืชผล",
        "subDistricts": [
          {
            "name": "ขุหลุ",
            "postalCode": "34130"
          },
          {
            "name": "กระเดียน",
            "postalCode": "34130"
          },
          {
            "name": "เกษม",
            "postalCode": "34130"
          },
          {
            "name": "กุศกร",
            "postalCode": "34130"
          },
          {
            "name": "ขามเปี้ย",
            "postalCode": "34130"
          },
          {
            "name": "คอนสาย",
            "postalCode": "34130"
          },
          {
            "name": "โคกจาน",
            "postalCode": "34130"
          },
          {
            "name": "นาพิน",
            "postalCode": "34130"
          },
          {
            "name": "นาสะไม",
            "postalCode": "34130"
          },
          {
            "name": "โนนกุง",
            "postalCode": "34130"
          },
          {
            "name": "ตระการ",
            "postalCode": "34130"
          },
          {
            "name": "ตากแดด",
            "postalCode": "34130"
          },
          {
            "name": "ไหล่ทุ่ง",
            "postalCode": "34130"
          },
          {
            "name": "เป้า",
            "postalCode": "34130"
          },
          {
            "name": "เซเป็ด",
            "postalCode": "34130"
          },
          {
            "name": "สะพือ",
            "postalCode": "34130"
          },
          {
            "name": "หนองเต่า",
            "postalCode": "34130"
          },
          {
            "name": "ถ้ำแข้",
            "postalCode": "34130"
          },
          {
            "name": "ท่าหลวง",
            "postalCode": "34130"
          },
          {
            "name": "ห้วยฝ้ายพัฒนา",
            "postalCode": "34130"
          },
          {
            "name": "กุดยาลวน",
            "postalCode": "34130"
          },
          {
            "name": "บ้านแดง",
            "postalCode": "34130"
          },
          {
            "name": "คำเจริญ",
            "postalCode": "34130"
          }
        ]
      },
      {
        "name": "กุดข้าวปุ้น",
        "subDistricts": [
          {
            "name": "ข้าวปุ้น",
            "postalCode": "34270"
          },
          {
            "name": "โนนสวาง",
            "postalCode": "34270"
          },
          {
            "name": "แก่งเค็ง",
            "postalCode": "34270"
          },
          {
            "name": "กาบิน",
            "postalCode": "34270"
          },
          {
            "name": "หนองทันน้ำ",
            "postalCode": "34270"
          }
        ]
      },
      {
        "name": "ม่วงสามสิบ",
        "subDistricts": [
          {
            "name": "ม่วงสามสิบ",
            "postalCode": "34140"
          },
          {
            "name": "เหล่าบก",
            "postalCode": "34140"
          },
          {
            "name": "ดุมใหญ่",
            "postalCode": "34140"
          },
          {
            "name": "หนองช้างใหญ่",
            "postalCode": "34140"
          },
          {
            "name": "หนองเมือง",
            "postalCode": "34140"
          },
          {
            "name": "เตย",
            "postalCode": "34140"
          },
          {
            "name": "ยางสักกระโพหลุ่ม",
            "postalCode": "34140"
          },
          {
            "name": "หนองไข่นก",
            "postalCode": "34140"
          },
          {
            "name": "หนองเหล่า",
            "postalCode": "34140"
          },
          {
            "name": "หนองฮาง",
            "postalCode": "34140"
          },
          {
            "name": "ยางโยภาพ",
            "postalCode": "34140"
          },
          {
            "name": "ไผ่ใหญ่",
            "postalCode": "34140"
          },
          {
            "name": "นาเลิง",
            "postalCode": "34140"
          },
          {
            "name": "โพนแพง",
            "postalCode": "34140"
          }
        ]
      },
      {
        "name": "วารินชำราบ",
        "subDistricts": [
          {
            "name": "วารินชำราบ",
            "postalCode": "34190"
          },
          {
            "name": "ธาตุ",
            "postalCode": "34190"
          },
          {
            "name": "ท่าลาด",
            "postalCode": "34310"
          },
          {
            "name": "โนนโหนน",
            "postalCode": "34190"
          },
          {
            "name": "คูเมือง",
            "postalCode": "34190"
          },
          {
            "name": "สระสมิง",
            "postalCode": "34190"
          },
          {
            "name": "คำน้ำแซบ",
            "postalCode": "34190"
          },
          {
            "name": "บุ่งหวาย",
            "postalCode": "34310"
          },
          {
            "name": "คำขวาง",
            "postalCode": "34190"
          },
          {
            "name": "โพธิ์ใหญ่",
            "postalCode": "34190"
          },
          {
            "name": "แสนสุข",
            "postalCode": "34190"
          },
          {
            "name": "หนองกินเพล",
            "postalCode": "34190"
          },
          {
            "name": "โนนผึ้ง",
            "postalCode": "34190"
          },
          {
            "name": "เมืองศรีไค",
            "postalCode": "34190"
          },
          {
            "name": "ห้วยขะยูง",
            "postalCode": "34310"
          },
          {
            "name": "บุ่งไหม",
            "postalCode": "34190"
          }
        ]
      },
      {
        "name": "พิบูลมังสาหาร",
        "subDistricts": [
          {
            "name": "พิบูล",
            "postalCode": "34110"
          },
          {
            "name": "กุดชมภู",
            "postalCode": "34110"
          },
          {
            "name": "ดอนจิก",
            "postalCode": "34110"
          },
          {
            "name": "ทรายมูล",
            "postalCode": "34110"
          },
          {
            "name": "นาโพธิ์",
            "postalCode": "34110"
          },
          {
            "name": "โนนกลาง",
            "postalCode": "34110"
          },
          {
            "name": "โพธิ์ไทร",
            "postalCode": "34110"
          },
          {
            "name": "โพธิ์ศรี",
            "postalCode": "34110"
          },
          {
            "name": "ระเว",
            "postalCode": "34110"
          },
          {
            "name": "ไร่ใต้",
            "postalCode": "34110"
          },
          {
            "name": "หนองบัวฮี",
            "postalCode": "34110"
          },
          {
            "name": "อ่างศิลา",
            "postalCode": "34110"
          },
          {
            "name": "โนนกาหลง",
            "postalCode": "34110"
          },
          {
            "name": "บ้านแขม",
            "postalCode": "34110"
          }
        ]
      },
      {
        "name": "ตาลสุม",
        "subDistricts": [
          {
            "name": "ตาลสุม",
            "postalCode": "34330"
          },
          {
            "name": "สำโรง",
            "postalCode": "34330"
          },
          {
            "name": "จิกเทิง",
            "postalCode": "34330"
          },
          {
            "name": "หนองกุง",
            "postalCode": "34330"
          },
          {
            "name": "นาคาย",
            "postalCode": "34330"
          },
          {
            "name": "คำหว้า",
            "postalCode": "34330"
          }
        ]
      },
      {
        "name": "โพธิ์ไทร",
        "subDistricts": [
          {
            "name": "โพธิ์ไทร",
            "postalCode": "34340"
          },
          {
            "name": "ม่วงใหญ่",
            "postalCode": "34340"
          },
          {
            "name": "สำโรง",
            "postalCode": "34340"
          },
          {
            "name": "สองคอน",
            "postalCode": "34340"
          },
          {
            "name": "สารภี",
            "postalCode": "34340"
          },
          {
            "name": "เหล่างาม",
            "postalCode": "34340"
          }
        ]
      },
      {
        "name": "สำโรง",
        "subDistricts": [
          {
            "name": "สำโรง",
            "postalCode": "34360"
          },
          {
            "name": "โคกก่อง",
            "postalCode": "34360"
          },
          {
            "name": "หนองไฮ",
            "postalCode": "34360"
          },
          {
            "name": "ค้อน้อย",
            "postalCode": "34360"
          },
          {
            "name": "โนนกาเล็น",
            "postalCode": "34360"
          },
          {
            "name": "โคกสว่าง",
            "postalCode": "34360"
          },
          {
            "name": "โนนกลาง",
            "postalCode": "34360"
          },
          {
            "name": "บอน",
            "postalCode": "34360"
          },
          {
            "name": "ขามป้อม",
            "postalCode": "34360"
          }
        ]
      },
      {
        "name": "ดอนมดแดง",
        "subDistricts": [
          {
            "name": "ดอนมดแดง",
            "postalCode": "34000"
          },
          {
            "name": "เหล่าแดง",
            "postalCode": "34000"
          },
          {
            "name": "ท่าเมือง",
            "postalCode": "34000"
          },
          {
            "name": "คำไฮใหญ่",
            "postalCode": "34000"
          }
        ]
      },
      {
        "name": "สิรินธร",
        "subDistricts": [
          {
            "name": "คันไร่",
            "postalCode": "34350"
          },
          {
            "name": "ช่องเม็ก",
            "postalCode": "34350"
          },
          {
            "name": "โนนก่อ",
            "postalCode": "34350"
          },
          {
            "name": "นิคมสร้างตนเองลำโดมน้อย",
            "postalCode": "34350"
          },
          {
            "name": "ฝางคำ",
            "postalCode": "34350"
          },
          {
            "name": "คำเขื่อนแก้ว",
            "postalCode": "34350"
          }
        ]
      },
      {
        "name": "ทุ่งศรีอุดม",
        "subDistricts": [
          {
            "name": "หนองอ้ม",
            "postalCode": "34160"
          },
          {
            "name": "นาเกษม",
            "postalCode": "34160"
          },
          {
            "name": "กุดเรือ",
            "postalCode": "34160"
          },
          {
            "name": "โคกชำแระ",
            "postalCode": "34160"
          },
          {
            "name": "นาห่อม",
            "postalCode": "34160"
          }
        ]
      },
      {
        "name": "นาเยีย",
        "subDistricts": [
          {
            "name": "นาเยีย",
            "postalCode": "34160"
          },
          {
            "name": "นาดี",
            "postalCode": "34160"
          },
          {
            "name": "นาเรือง",
            "postalCode": "34160"
          }
        ]
      },
      {
        "name": "นาตาล",
        "subDistricts": [
          {
            "name": "นาตาล",
            "postalCode": "34170"
          },
          {
            "name": "พะลาน",
            "postalCode": "34170"
          },
          {
            "name": "กองโพน",
            "postalCode": "34170"
          },
          {
            "name": "พังเคน",
            "postalCode": "34170"
          }
        ]
      },
      {
        "name": "เหล่าเสือโก้ก",
        "subDistricts": [
          {
            "name": "เหล่าเสือโก้ก",
            "postalCode": "34000"
          },
          {
            "name": "โพนเมือง",
            "postalCode": "34000"
          },
          {
            "name": "แพงใหญ่",
            "postalCode": "34000"
          },
          {
            "name": "หนองบก",
            "postalCode": "34000"
          }
        ]
      },
      {
        "name": "สว่างวีระวงศ์",
        "subDistricts": [
          {
            "name": "แก่งโดม",
            "postalCode": "34190"
          },
          {
            "name": "ท่าช้าง",
            "postalCode": "34190"
          },
          {
            "name": "บุ่งมะแลง",
            "postalCode": "34190"
          },
          {
            "name": "สว่าง",
            "postalCode": "34190"
          }
        ]
      },
      {
        "name": "น้ำขุ่น",
        "subDistricts": [
          {
            "name": "ตาเกา",
            "postalCode": "34260"
          },
          {
            "name": "ไพบูลย์",
            "postalCode": "34260"
          },
          {
            "name": "ขี้เหล็ก",
            "postalCode": "34260"
          },
          {
            "name": "โคกสะอาด",
            "postalCode": "34260"
          }
        ]
      }
    ]
  },
  {
    "name": "ยโสธร",
    "districts": [
      {
        "name": "เมืองยโสธร",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "35000"
          },
          {
            "name": "น้ำคำใหญ่",
            "postalCode": "35000"
          },
          {
            "name": "ตาดทอง",
            "postalCode": "35000"
          },
          {
            "name": "สำราญ",
            "postalCode": "35000"
          },
          {
            "name": "ค้อเหนือ",
            "postalCode": "35000"
          },
          {
            "name": "ดู่ทุ่ง",
            "postalCode": "35000"
          },
          {
            "name": "เดิด",
            "postalCode": "35000"
          },
          {
            "name": "ขั้นไดใหญ่",
            "postalCode": "35000"
          },
          {
            "name": "ทุ่งแต้",
            "postalCode": "35000"
          },
          {
            "name": "สิงห์",
            "postalCode": "35000"
          },
          {
            "name": "นาสะไมย์",
            "postalCode": "35000"
          },
          {
            "name": "เขื่องคำ",
            "postalCode": "35000"
          },
          {
            "name": "หนองหิน",
            "postalCode": "35000"
          },
          {
            "name": "หนองคู",
            "postalCode": "35000"
          },
          {
            "name": "ขุมเงิน",
            "postalCode": "35000"
          },
          {
            "name": "ทุ่งนางโอก",
            "postalCode": "35000"
          },
          {
            "name": "หนองเรือ",
            "postalCode": "35000"
          },
          {
            "name": "หนองเป็ด",
            "postalCode": "35000"
          }
        ]
      },
      {
        "name": "ทรายมูล",
        "subDistricts": [
          {
            "name": "ทรายมูล",
            "postalCode": "35170"
          },
          {
            "name": "ดู่ลาด",
            "postalCode": "35170"
          },
          {
            "name": "ดงมะไฟ",
            "postalCode": "35170"
          },
          {
            "name": "นาเวียง",
            "postalCode": "35170"
          },
          {
            "name": "ไผ่",
            "postalCode": "35170"
          }
        ]
      },
      {
        "name": "กุดชุม",
        "subDistricts": [
          {
            "name": "กุดชุม",
            "postalCode": "35140"
          },
          {
            "name": "โนนเปือย",
            "postalCode": "35140"
          },
          {
            "name": "กำแมด",
            "postalCode": "35140"
          },
          {
            "name": "นาโส่",
            "postalCode": "35140"
          },
          {
            "name": "ห้วยแก้ง",
            "postalCode": "35140"
          },
          {
            "name": "หนองหมี",
            "postalCode": "35140"
          },
          {
            "name": "โพนงาม",
            "postalCode": "35140"
          },
          {
            "name": "คำน้ำสร้าง",
            "postalCode": "35140"
          },
          {
            "name": "หนองแหน",
            "postalCode": "35140"
          }
        ]
      },
      {
        "name": "คำเขื่อนแก้ว",
        "subDistricts": [
          {
            "name": "ลุมพุก",
            "postalCode": "35110"
          },
          {
            "name": "ย่อ",
            "postalCode": "35110"
          },
          {
            "name": "สงเปือย",
            "postalCode": "35110"
          },
          {
            "name": "โพนทัน",
            "postalCode": "35110"
          },
          {
            "name": "ทุ่งมน",
            "postalCode": "35110"
          },
          {
            "name": "นาคำ",
            "postalCode": "35180"
          },
          {
            "name": "ดงแคนใหญ่",
            "postalCode": "35180"
          },
          {
            "name": "กู่จาน",
            "postalCode": "35110"
          },
          {
            "name": "นาแก",
            "postalCode": "35180"
          },
          {
            "name": "กุดกุง",
            "postalCode": "35110"
          },
          {
            "name": "เหล่าไฮ",
            "postalCode": "35110"
          },
          {
            "name": "แคนน้อย",
            "postalCode": "35180"
          },
          {
            "name": "ดงเจริญ",
            "postalCode": "35110"
          }
        ]
      },
      {
        "name": "ป่าติ้ว",
        "subDistricts": [
          {
            "name": "โพธิ์ไทร",
            "postalCode": "35150"
          },
          {
            "name": "กระจาย",
            "postalCode": "35150"
          },
          {
            "name": "โคกนาโก",
            "postalCode": "35150"
          },
          {
            "name": "เชียงเพ็ง",
            "postalCode": "35150"
          },
          {
            "name": "ศรีฐาน",
            "postalCode": "35150"
          }
        ]
      },
      {
        "name": "มหาชนะชัย",
        "subDistricts": [
          {
            "name": "ฟ้าหยาด",
            "postalCode": "35130"
          },
          {
            "name": "หัวเมือง",
            "postalCode": "35130"
          },
          {
            "name": "คูเมือง",
            "postalCode": "35130"
          },
          {
            "name": "ผือฮี",
            "postalCode": "35130"
          },
          {
            "name": "บากเรือ",
            "postalCode": "35130"
          },
          {
            "name": "ม่วง",
            "postalCode": "35130"
          },
          {
            "name": "โนนทราย",
            "postalCode": "35130"
          },
          {
            "name": "บึงแก",
            "postalCode": "35130"
          },
          {
            "name": "พระเสาร์",
            "postalCode": "35130"
          },
          {
            "name": "สงยาง",
            "postalCode": "35130"
          }
        ]
      },
      {
        "name": "ค้อวัง",
        "subDistricts": [
          {
            "name": "ฟ้าห่วน",
            "postalCode": "35160"
          },
          {
            "name": "กุดน้ำใส",
            "postalCode": "35160"
          },
          {
            "name": "น้ำอ้อม",
            "postalCode": "35160"
          },
          {
            "name": "ค้อวัง",
            "postalCode": "35160"
          }
        ]
      },
      {
        "name": "เลิงนกทา",
        "subDistricts": [
          {
            "name": "บุ่งค้า",
            "postalCode": "35120"
          },
          {
            "name": "สวาท",
            "postalCode": "35120"
          },
          {
            "name": "ห้องแซง",
            "postalCode": "35120"
          },
          {
            "name": "สามัคคี",
            "postalCode": "35120"
          },
          {
            "name": "กุดเชียงหมี",
            "postalCode": "35120"
          },
          {
            "name": "สามแยก",
            "postalCode": "35120"
          },
          {
            "name": "กุดแห่",
            "postalCode": "35120"
          },
          {
            "name": "โคกสำราญ",
            "postalCode": "35120"
          },
          {
            "name": "สร้างมิ่ง",
            "postalCode": "35120"
          },
          {
            "name": "ศรีแก้ว",
            "postalCode": "35120"
          }
        ]
      },
      {
        "name": "ไทยเจริญ",
        "subDistricts": [
          {
            "name": "ไทยเจริญ",
            "postalCode": "35120"
          },
          {
            "name": "น้ำคำ",
            "postalCode": "35120"
          },
          {
            "name": "ส้มผ่อ",
            "postalCode": "35120"
          },
          {
            "name": "คำเตย",
            "postalCode": "35120"
          },
          {
            "name": "คำไผ่",
            "postalCode": "35120"
          }
        ]
      }
    ]
  },
  {
    "name": "ชัยภูมิ",
    "districts": [
      {
        "name": "เมืองชัยภูมิ",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "36000"
          },
          {
            "name": "รอบเมือง",
            "postalCode": "36000"
          },
          {
            "name": "โพนทอง",
            "postalCode": "36000"
          },
          {
            "name": "นาฝาย",
            "postalCode": "36000"
          },
          {
            "name": "บ้านค่าย",
            "postalCode": "36240"
          },
          {
            "name": "กุดตุ้ม",
            "postalCode": "36000"
          },
          {
            "name": "ชีลอง",
            "postalCode": "36000"
          },
          {
            "name": "บ้านเล่า",
            "postalCode": "36000"
          },
          {
            "name": "นาเสียว",
            "postalCode": "36000"
          },
          {
            "name": "หนองนาแซง",
            "postalCode": "36000"
          },
          {
            "name": "ลาดใหญ่",
            "postalCode": "36000"
          },
          {
            "name": "หนองไผ่",
            "postalCode": "36240"
          },
          {
            "name": "ท่าหินโงม",
            "postalCode": "36000"
          },
          {
            "name": "ห้วยต้อน",
            "postalCode": "36000"
          },
          {
            "name": "ห้วยบง",
            "postalCode": "36000"
          },
          {
            "name": "โนนสำราญ",
            "postalCode": "36240"
          },
          {
            "name": "โคกสูง",
            "postalCode": "36000"
          },
          {
            "name": "บุ่งคล้า",
            "postalCode": "36000"
          },
          {
            "name": "ซับสีทอง",
            "postalCode": "36000"
          }
        ]
      },
      {
        "name": "บ้านเขว้า",
        "subDistricts": [
          {
            "name": "บ้านเขว้า",
            "postalCode": "36170"
          },
          {
            "name": "ตลาดแร้ง",
            "postalCode": "36170"
          },
          {
            "name": "ลุ่มลำชี",
            "postalCode": "36170"
          },
          {
            "name": "ชีบน",
            "postalCode": "36170"
          },
          {
            "name": "ภูแลนคา",
            "postalCode": "36170"
          },
          {
            "name": "โนนแดง",
            "postalCode": "36170"
          }
        ]
      },
      {
        "name": "คอนสวรรค์",
        "subDistricts": [
          {
            "name": "คอนสวรรค์",
            "postalCode": "36140"
          },
          {
            "name": "ยางหวาย",
            "postalCode": "36140"
          },
          {
            "name": "ช่องสามหมอ",
            "postalCode": "36140"
          },
          {
            "name": "โนนสะอาด",
            "postalCode": "36140"
          },
          {
            "name": "ห้วยไร่",
            "postalCode": "36140"
          },
          {
            "name": "บ้านโสก",
            "postalCode": "36140"
          },
          {
            "name": "โคกมั่งงอย",
            "postalCode": "36140"
          },
          {
            "name": "หนองขาม",
            "postalCode": "36140"
          },
          {
            "name": "ศรีสำราญ",
            "postalCode": "36140"
          }
        ]
      },
      {
        "name": "เกษตรสมบูรณ์",
        "subDistricts": [
          {
            "name": "บ้านยาง",
            "postalCode": "36120"
          },
          {
            "name": "บ้านหัน",
            "postalCode": "36120"
          },
          {
            "name": "บ้านเดื่อ",
            "postalCode": "36120"
          },
          {
            "name": "บ้านเป้า",
            "postalCode": "36120"
          },
          {
            "name": "กุดเลาะ",
            "postalCode": "36120"
          },
          {
            "name": "โนนกอก",
            "postalCode": "36120"
          },
          {
            "name": "สระโพนทอง",
            "postalCode": "36120"
          },
          {
            "name": "หนองข่า",
            "postalCode": "36120"
          },
          {
            "name": "หนองโพนงาม",
            "postalCode": "36120"
          },
          {
            "name": "บ้านบัว",
            "postalCode": "36120"
          },
          {
            "name": "โนนทอง",
            "postalCode": "36120"
          }
        ]
      },
      {
        "name": "หนองบัวแดง",
        "subDistricts": [
          {
            "name": "หนองบัวแดง",
            "postalCode": "36210"
          },
          {
            "name": "กุดชุมแสง",
            "postalCode": "36210"
          },
          {
            "name": "ถ้ำวัวแดง",
            "postalCode": "36210"
          },
          {
            "name": "นางแดด",
            "postalCode": "36210"
          },
          {
            "name": "หนองแวง",
            "postalCode": "36210"
          },
          {
            "name": "คูเมือง",
            "postalCode": "36210"
          },
          {
            "name": "ท่าใหญ่",
            "postalCode": "36210"
          },
          {
            "name": "วังชมภู",
            "postalCode": "36210"
          }
        ]
      },
      {
        "name": "จัตุรัส",
        "subDistricts": [
          {
            "name": "บ้านกอก",
            "postalCode": "36130"
          },
          {
            "name": "หนองบัวบาน",
            "postalCode": "36130"
          },
          {
            "name": "บ้านขาม",
            "postalCode": "36130"
          },
          {
            "name": "กุดน้ำใส",
            "postalCode": "36130"
          },
          {
            "name": "หนองโดน",
            "postalCode": "36130"
          },
          {
            "name": "ละหาน",
            "postalCode": "36130"
          },
          {
            "name": "หนองบัวใหญ่",
            "postalCode": "36130"
          },
          {
            "name": "หนองบัวโคก",
            "postalCode": "36220"
          },
          {
            "name": "ส้มป่อย",
            "postalCode": "36130"
          }
        ]
      },
      {
        "name": "บำเหน็จณรงค์",
        "subDistricts": [
          {
            "name": "บ้านชวน",
            "postalCode": "36160"
          },
          {
            "name": "บ้านเพชร",
            "postalCode": "36160"
          },
          {
            "name": "บ้านตาล",
            "postalCode": "36220"
          },
          {
            "name": "หัวทะเล",
            "postalCode": "36220"
          },
          {
            "name": "โคกเริงรมย์",
            "postalCode": "36160"
          },
          {
            "name": "เกาะมะนาว",
            "postalCode": "36160"
          },
          {
            "name": "โคกเพชรพัฒนา",
            "postalCode": "36160"
          }
        ]
      },
      {
        "name": "หนองบัวระเหว",
        "subDistricts": [
          {
            "name": "หนองบัวระเหว",
            "postalCode": "36250"
          },
          {
            "name": "วังตะเฆ่",
            "postalCode": "36250"
          },
          {
            "name": "ห้วยแย้",
            "postalCode": "36250"
          },
          {
            "name": "โคกสะอาด",
            "postalCode": "36250"
          },
          {
            "name": "โสกปลาดุก",
            "postalCode": "36250"
          }
        ]
      },
      {
        "name": "เทพสถิต",
        "subDistricts": [
          {
            "name": "วะตะแบก",
            "postalCode": "36230"
          },
          {
            "name": "ห้วยยายจิ๋ว",
            "postalCode": "36230"
          },
          {
            "name": "นายางกลัก",
            "postalCode": "36230"
          },
          {
            "name": "บ้านไร่",
            "postalCode": "36230"
          },
          {
            "name": "โป่งนก",
            "postalCode": "36230"
          }
        ]
      },
      {
        "name": "ภูเขียว",
        "subDistricts": [
          {
            "name": "ผักปัง",
            "postalCode": "36110"
          },
          {
            "name": "กวางโจน",
            "postalCode": "36110"
          },
          {
            "name": "หนองคอนไทย",
            "postalCode": "36110"
          },
          {
            "name": "บ้านแก้ง",
            "postalCode": "36110"
          },
          {
            "name": "กุดยม",
            "postalCode": "36110"
          },
          {
            "name": "บ้านเพชร",
            "postalCode": "36110"
          },
          {
            "name": "โคกสะอาด",
            "postalCode": "36110"
          },
          {
            "name": "หนองตูม",
            "postalCode": "36110"
          },
          {
            "name": "โอโล",
            "postalCode": "36110"
          },
          {
            "name": "ธาตุทอง",
            "postalCode": "36110"
          },
          {
            "name": "บ้านดอน",
            "postalCode": "36110"
          }
        ]
      },
      {
        "name": "บ้านแท่น",
        "subDistricts": [
          {
            "name": "บ้านแท่น",
            "postalCode": "36190"
          },
          {
            "name": "สามสวน",
            "postalCode": "36190"
          },
          {
            "name": "สระพัง",
            "postalCode": "36190"
          },
          {
            "name": "บ้านเต่า",
            "postalCode": "36190"
          },
          {
            "name": "หนองคู",
            "postalCode": "36190"
          }
        ]
      },
      {
        "name": "แก้งคร้อ",
        "subDistricts": [
          {
            "name": "ช่องสามหมอ",
            "postalCode": "36150"
          },
          {
            "name": "หนองขาม",
            "postalCode": "36150"
          },
          {
            "name": "นาหนองทุ่ม",
            "postalCode": "36150"
          },
          {
            "name": "บ้านแก้ง",
            "postalCode": "36150"
          },
          {
            "name": "หนองสังข์",
            "postalCode": "36150"
          },
          {
            "name": "หลุบคา",
            "postalCode": "36150"
          },
          {
            "name": "โคกกุง",
            "postalCode": "36150"
          },
          {
            "name": "เก่าย่าดี",
            "postalCode": "36150"
          },
          {
            "name": "ท่ามะไฟหวาน",
            "postalCode": "36150"
          },
          {
            "name": "หนองไผ่",
            "postalCode": "36150"
          }
        ]
      },
      {
        "name": "คอนสาร",
        "subDistricts": [
          {
            "name": "คอนสาร",
            "postalCode": "36180"
          },
          {
            "name": "ทุ่งพระ",
            "postalCode": "36180"
          },
          {
            "name": "โนนคูณ",
            "postalCode": "36180"
          },
          {
            "name": "ห้วยยาง",
            "postalCode": "36180"
          },
          {
            "name": "ทุ่งลุยลาย",
            "postalCode": "36180"
          },
          {
            "name": "ดงบัง",
            "postalCode": "36180"
          },
          {
            "name": "ทุ่งนาเลา",
            "postalCode": "36180"
          },
          {
            "name": "ดงกลาง",
            "postalCode": "36180"
          }
        ]
      },
      {
        "name": "ภักดีชุมพล",
        "subDistricts": [
          {
            "name": "บ้านเจียง",
            "postalCode": "36260"
          },
          {
            "name": "เจาทอง",
            "postalCode": "36260"
          },
          {
            "name": "วังทอง",
            "postalCode": "36260"
          },
          {
            "name": "แหลมทอง",
            "postalCode": "36260"
          }
        ]
      },
      {
        "name": "เนินสง่า",
        "subDistricts": [
          {
            "name": "หนองฉิม",
            "postalCode": "36130"
          },
          {
            "name": "ตาเนิน",
            "postalCode": "36130"
          },
          {
            "name": "กะฮาด",
            "postalCode": "36130"
          },
          {
            "name": "รังงาม",
            "postalCode": "36130"
          }
        ]
      },
      {
        "name": "ซับใหญ่",
        "subDistricts": [
          {
            "name": "ซับใหญ่",
            "postalCode": "36130"
          },
          {
            "name": "ท่ากูบ",
            "postalCode": "36130"
          },
          {
            "name": "ตะโกทอง",
            "postalCode": "36130"
          }
        ]
      }
    ]
  },
  {
    "name": "อำนาจเจริญ",
    "districts": [
      {
        "name": "เมืองอำนาจเจริญ",
        "subDistricts": [
          {
            "name": "บุ่ง",
            "postalCode": "37000"
          },
          {
            "name": "ไก่คำ",
            "postalCode": "37000"
          },
          {
            "name": "นาจิก",
            "postalCode": "37000"
          },
          {
            "name": "ปลาค้าว",
            "postalCode": "37000"
          },
          {
            "name": "เหล่าพรวน",
            "postalCode": "37000"
          },
          {
            "name": "สร้างนกทา",
            "postalCode": "37000"
          },
          {
            "name": "คึมใหญ่",
            "postalCode": "37000"
          },
          {
            "name": "นาผือ",
            "postalCode": "37000"
          },
          {
            "name": "น้ำปลีก",
            "postalCode": "37000"
          },
          {
            "name": "นาวัง",
            "postalCode": "37000"
          },
          {
            "name": "นาหมอม้า",
            "postalCode": "37000"
          },
          {
            "name": "โนนโพธิ์",
            "postalCode": "37000"
          },
          {
            "name": "โนนหนามแท่ง",
            "postalCode": "37000"
          },
          {
            "name": "ห้วยไร่",
            "postalCode": "37000"
          },
          {
            "name": "หนองมะแซว",
            "postalCode": "37000"
          },
          {
            "name": "กุดปลาดุก",
            "postalCode": "37000"
          },
          {
            "name": "ดอนเมย",
            "postalCode": "37000"
          },
          {
            "name": "นายม",
            "postalCode": "37000"
          },
          {
            "name": "นาแต้",
            "postalCode": "37000"
          }
        ]
      },
      {
        "name": "ชานุมาน",
        "subDistricts": [
          {
            "name": "ชานุมาน",
            "postalCode": "37210"
          },
          {
            "name": "โคกสาร",
            "postalCode": "37210"
          },
          {
            "name": "คำเขื่อนแก้ว",
            "postalCode": "37210"
          },
          {
            "name": "โคกก่ง",
            "postalCode": "37210"
          },
          {
            "name": "ป่าก่อ",
            "postalCode": "37210"
          }
        ]
      },
      {
        "name": "ปทุมราชวงศา",
        "subDistricts": [
          {
            "name": "หนองข่า",
            "postalCode": "37110"
          },
          {
            "name": "คำโพน",
            "postalCode": "37110"
          },
          {
            "name": "นาหว้า",
            "postalCode": "37110"
          },
          {
            "name": "ลือ",
            "postalCode": "37110"
          },
          {
            "name": "ห้วย",
            "postalCode": "37110"
          },
          {
            "name": "โนนงาม",
            "postalCode": "37110"
          },
          {
            "name": "นาป่าแซง",
            "postalCode": "37110"
          }
        ]
      },
      {
        "name": "พนา",
        "subDistricts": [
          {
            "name": "พนา",
            "postalCode": "37180"
          },
          {
            "name": "จานลาน",
            "postalCode": "37180"
          },
          {
            "name": "ไม้กลอน",
            "postalCode": "37180"
          },
          {
            "name": "พระเหลา",
            "postalCode": "37180"
          }
        ]
      },
      {
        "name": "เสนางคนิคม",
        "subDistricts": [
          {
            "name": "เสนางคนิคม",
            "postalCode": "37290"
          },
          {
            "name": "โพนทอง",
            "postalCode": "37290"
          },
          {
            "name": "ไร่สีสุก",
            "postalCode": "37290"
          },
          {
            "name": "นาเวียง",
            "postalCode": "37290"
          },
          {
            "name": "หนองไฮ",
            "postalCode": "37290"
          },
          {
            "name": "หนองสามสี",
            "postalCode": "37290"
          }
        ]
      },
      {
        "name": "หัวตะพาน",
        "subDistricts": [
          {
            "name": "หัวตะพาน",
            "postalCode": "37240"
          },
          {
            "name": "คำพระ",
            "postalCode": "37240"
          },
          {
            "name": "เค็งใหญ่",
            "postalCode": "37240"
          },
          {
            "name": "หนองแก้ว",
            "postalCode": "37240"
          },
          {
            "name": "โพนเมืองน้อย",
            "postalCode": "37240"
          },
          {
            "name": "สร้างถ่อน้อย",
            "postalCode": "37240"
          },
          {
            "name": "จิกดู่",
            "postalCode": "37240"
          },
          {
            "name": "รัตนวารี",
            "postalCode": "37240"
          }
        ]
      },
      {
        "name": "ลืออำนาจ",
        "subDistricts": [
          {
            "name": "อำนาจ",
            "postalCode": "37000"
          },
          {
            "name": "ดงมะยาง",
            "postalCode": "37000"
          },
          {
            "name": "เปือย",
            "postalCode": "37000"
          },
          {
            "name": "ดงบัง",
            "postalCode": "37000"
          },
          {
            "name": "ไร่ขี",
            "postalCode": "37000"
          },
          {
            "name": "แมด",
            "postalCode": "37000"
          },
          {
            "name": "โคกกลาง",
            "postalCode": "37000"
          }
        ]
      }
    ]
  },
  {
    "name": "บึงกาฬ",
    "districts": [
      {
        "name": "เมืองบึงกาฬ",
        "subDistricts": [
          {
            "name": "คำนาดี",
            "postalCode": "38000"
          },
          {
            "name": "บึงโขงหลง",
            "postalCode": "38000"
          },
          {
            "name": "ไคสี",
            "postalCode": "38000"
          },
          {
            "name": "ชัยพร",
            "postalCode": "38000"
          },
          {
            "name": "นาสวรรค์",
            "postalCode": "38000"
          },
          {
            "name": "โนนสมบูรณ์",
            "postalCode": "38000"
          },
          {
            "name": "บึงกาฬ",
            "postalCode": "38000"
          },
          {
            "name": "โป่งเปื่อย",
            "postalCode": "38000"
          },
          {
            "name": "วิศิษฐ์",
            "postalCode": "38000"
          },
          {
            "name": "หนองเข็ง",
            "postalCode": "38000"
          },
          {
            "name": "หนองเลิง",
            "postalCode": "38000"
          },
          {
            "name": "หอคำ",
            "postalCode": "38000"
          }
        ]
      },
      {
        "name": "เซกา",
        "subDistricts": [
          {
            "name": "ซาง",
            "postalCode": "38150"
          },
          {
            "name": "เซกา",
            "postalCode": "38150"
          },
          {
            "name": "ท่ากกแดง",
            "postalCode": "38150"
          },
          {
            "name": "ท่าสะอาด",
            "postalCode": "38150"
          },
          {
            "name": "น้ำจั้น",
            "postalCode": "38150"
          },
          {
            "name": "บ้านต้อง",
            "postalCode": "38150"
          },
          {
            "name": "ป่งไฮ",
            "postalCode": "38150"
          },
          {
            "name": "โสกก่าม",
            "postalCode": "38150"
          },
          {
            "name": "หนองทุ่ม",
            "postalCode": "38150"
          }
        ]
      },
      {
        "name": "โซ่พิสัย",
        "subDistricts": [
          {
            "name": "คำแก้ว",
            "postalCode": "38170"
          },
          {
            "name": "โซ่",
            "postalCode": "38170"
          },
          {
            "name": "ถ้ำเจริญ",
            "postalCode": "38170"
          },
          {
            "name": "บัวตูม",
            "postalCode": "38170"
          },
          {
            "name": "ศรีชมภู",
            "postalCode": "38170"
          },
          {
            "name": "หนองพันทา",
            "postalCode": "38170"
          },
          {
            "name": "เหล่าทอง",
            "postalCode": "38170"
          }
        ]
      },
      {
        "name": "พรเจริญ",
        "subDistricts": [
          {
            "name": "ดอนหญ้านาง",
            "postalCode": "38180"
          },
          {
            "name": "ป่าแฝก",
            "postalCode": "38180"
          },
          {
            "name": "พรเจริญ",
            "postalCode": "38180"
          },
          {
            "name": "วังชมภู",
            "postalCode": "38180"
          },
          {
            "name": "ศรีชมภู",
            "postalCode": "38180"
          },
          {
            "name": "ศรีสำราญ",
            "postalCode": "38180"
          },
          {
            "name": "หนองหัวช้าง",
            "postalCode": "38180"
          }
        ]
      },
      {
        "name": "ศรีวิไล",
        "subDistricts": [
          {
            "name": "ชุมภูพร",
            "postalCode": "38210"
          },
          {
            "name": "นาสะแบง",
            "postalCode": "38210"
          },
          {
            "name": "นาสิงห์",
            "postalCode": "38210"
          },
          {
            "name": "นาแสง",
            "postalCode": "38210"
          },
          {
            "name": "ศรีวิไล",
            "postalCode": "38210"
          }
        ]
      },
      {
        "name": "บึงโขงหลง",
        "subDistricts": [
          {
            "name": "ดงบัง",
            "postalCode": "38220"
          },
          {
            "name": "ท่าดอกคำ",
            "postalCode": "38220"
          },
          {
            "name": "บึงโขงหลง",
            "postalCode": "38220"
          },
          {
            "name": "โพธิ์หมากแข้ง",
            "postalCode": "38220"
          }
        ]
      },
      {
        "name": "ปากคาด",
        "subDistricts": [
          {
            "name": "นากั้ง",
            "postalCode": "38190"
          },
          {
            "name": "นาดง",
            "postalCode": "38190"
          },
          {
            "name": "โนนศิลา",
            "postalCode": "38190"
          },
          {
            "name": "ปากคาด",
            "postalCode": "38190"
          },
          {
            "name": "ศรีวิไล",
            "postalCode": "38190"
          },
          {
            "name": "หนองยอง",
            "postalCode": "38190"
          }
        ]
      },
      {
        "name": "บุ่งคล้า",
        "subDistricts": [
          {
            "name": "โคกกว้าง",
            "postalCode": "38000"
          },
          {
            "name": "บุ่งคล้า",
            "postalCode": "38000"
          },
          {
            "name": "หนองเดิน",
            "postalCode": "38000"
          }
        ]
      }
    ]
  },
  {
    "name": "หนองบัวลำภู",
    "districts": [
      {
        "name": "เมืองหนองบัวลำภู",
        "subDistricts": [
          {
            "name": "หนองบัว",
            "postalCode": "39000"
          },
          {
            "name": "หนองภัยศูนย์",
            "postalCode": "39000"
          },
          {
            "name": "โพธิ์ชัย",
            "postalCode": "39000"
          },
          {
            "name": "หนองสวรรค์",
            "postalCode": "39000"
          },
          {
            "name": "หัวนา",
            "postalCode": "39000"
          },
          {
            "name": "บ้านขาม",
            "postalCode": "39000"
          },
          {
            "name": "นามะเฟือง",
            "postalCode": "39000"
          },
          {
            "name": "บ้านพร้าว",
            "postalCode": "39000"
          },
          {
            "name": "โนนขมิ้น",
            "postalCode": "39000"
          },
          {
            "name": "ลำภู",
            "postalCode": "39000"
          },
          {
            "name": "กุดจิก",
            "postalCode": "39000"
          },
          {
            "name": "โนนทัน",
            "postalCode": "39000"
          },
          {
            "name": "นาคำไฮ",
            "postalCode": "39000"
          },
          {
            "name": "ป่าไม้งาม",
            "postalCode": "39000"
          },
          {
            "name": "หนองหว้า",
            "postalCode": "39000"
          }
        ]
      },
      {
        "name": "นากลาง",
        "subDistricts": [
          {
            "name": "นากลาง",
            "postalCode": "39170"
          },
          {
            "name": "ด่านช้าง",
            "postalCode": "39170"
          },
          {
            "name": "กุดดินจี่",
            "postalCode": "39350"
          },
          {
            "name": "ฝั่งแดง",
            "postalCode": "39170"
          },
          {
            "name": "เก่ากลอย",
            "postalCode": "39350"
          },
          {
            "name": "โนนเมือง",
            "postalCode": "39170"
          },
          {
            "name": "อุทัยสวรรค์",
            "postalCode": "39170"
          },
          {
            "name": "ดงสวรรค์",
            "postalCode": "39350"
          },
          {
            "name": "กุดแห่",
            "postalCode": "39170"
          }
        ]
      },
      {
        "name": "โนนสัง",
        "subDistricts": [
          {
            "name": "โนนสัง",
            "postalCode": "39140"
          },
          {
            "name": "บ้านถิ่น",
            "postalCode": "39140"
          },
          {
            "name": "หนองเรือ",
            "postalCode": "39140"
          },
          {
            "name": "กุดดู่",
            "postalCode": "39140"
          },
          {
            "name": "บ้านค้อ",
            "postalCode": "39140"
          },
          {
            "name": "โนนเมือง",
            "postalCode": "39140"
          },
          {
            "name": "โคกใหญ่",
            "postalCode": "39140"
          },
          {
            "name": "โคกม่วง",
            "postalCode": "39140"
          },
          {
            "name": "นิคมพัฒนา",
            "postalCode": "39140"
          },
          {
            "name": "ปางกู่",
            "postalCode": "39140"
          }
        ]
      },
      {
        "name": "ศรีบุญเรือง",
        "subDistricts": [
          {
            "name": "เมืองใหม่",
            "postalCode": "39180"
          },
          {
            "name": "ศรีบุญเรือง",
            "postalCode": "39180"
          },
          {
            "name": "หนองบัวใต้",
            "postalCode": "39180"
          },
          {
            "name": "กุดสะเทียน",
            "postalCode": "39180"
          },
          {
            "name": "นากอก",
            "postalCode": "39180"
          },
          {
            "name": "โนนสะอาด",
            "postalCode": "39180"
          },
          {
            "name": "ยางหล่อ",
            "postalCode": "39180"
          },
          {
            "name": "โนนม่วง",
            "postalCode": "39180"
          },
          {
            "name": "หนองกุงแก้ว",
            "postalCode": "39180"
          },
          {
            "name": "หนองแก",
            "postalCode": "39180"
          },
          {
            "name": "ทรายทอง",
            "postalCode": "39180"
          },
          {
            "name": "หันนางาม",
            "postalCode": "39180"
          }
        ]
      },
      {
        "name": "สุวรรณคูหา",
        "subDistricts": [
          {
            "name": "นาสี",
            "postalCode": "39270"
          },
          {
            "name": "บ้านโคก",
            "postalCode": "39270"
          },
          {
            "name": "นาดี",
            "postalCode": "39270"
          },
          {
            "name": "นาด่าน",
            "postalCode": "39270"
          },
          {
            "name": "ดงมะไฟ",
            "postalCode": "39270"
          },
          {
            "name": "สุวรรณคูหา",
            "postalCode": "39270"
          },
          {
            "name": "บุญทัน",
            "postalCode": "39270"
          },
          {
            "name": "กุดผึ้ง",
            "postalCode": "39270"
          }
        ]
      },
      {
        "name": "นาวัง",
        "subDistricts": [
          {
            "name": "นาเหล่า",
            "postalCode": "39170"
          },
          {
            "name": "นาแก",
            "postalCode": "39170"
          },
          {
            "name": "วังทอง",
            "postalCode": "39170"
          },
          {
            "name": "วังปลาป้อม",
            "postalCode": "39170"
          },
          {
            "name": "เทพคีรี",
            "postalCode": "39170"
          }
        ]
      }
    ]
  },
  {
    "name": "ขอนแก่น",
    "districts": [
      {
        "name": "เมืองขอนแก่น",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "40000"
          },
          {
            "name": "สำราญ",
            "postalCode": "40000"
          },
          {
            "name": "โคกสี",
            "postalCode": "40000"
          },
          {
            "name": "ท่าพระ",
            "postalCode": "40260"
          },
          {
            "name": "บ้านทุ่ม",
            "postalCode": "40000"
          },
          {
            "name": "เมืองเก่า",
            "postalCode": "40000"
          },
          {
            "name": "พระลับ",
            "postalCode": "40000"
          },
          {
            "name": "สาวะถี",
            "postalCode": "40000"
          },
          {
            "name": "บ้านหว้า",
            "postalCode": "40000"
          },
          {
            "name": "บ้านค้อ",
            "postalCode": "40000"
          },
          {
            "name": "แดงใหญ่",
            "postalCode": "40000"
          },
          {
            "name": "ดอนช้าง",
            "postalCode": "40000"
          },
          {
            "name": "ดอนหัน",
            "postalCode": "40260"
          },
          {
            "name": "ศิลา",
            "postalCode": "40000"
          },
          {
            "name": "บ้านเป็ด",
            "postalCode": "40000"
          },
          {
            "name": "หนองตูม",
            "postalCode": "40000"
          },
          {
            "name": "บึงเนียม",
            "postalCode": "40000"
          },
          {
            "name": "โนนท่อน",
            "postalCode": "40000"
          }
        ]
      },
      {
        "name": "บ้านฝาง",
        "subDistricts": [
          {
            "name": "หนองบัว",
            "postalCode": "40270"
          },
          {
            "name": "ป่าหวายนั่ง",
            "postalCode": "40270"
          },
          {
            "name": "โนนฆ้อง",
            "postalCode": "40270"
          },
          {
            "name": "บ้านเหล่า",
            "postalCode": "40270"
          },
          {
            "name": "ป่ามะนาว",
            "postalCode": "40270"
          },
          {
            "name": "บ้านฝาง",
            "postalCode": "40270"
          },
          {
            "name": "โคกงาม",
            "postalCode": "40270"
          }
        ]
      },
      {
        "name": "พระยืน",
        "subDistricts": [
          {
            "name": "พระยืน",
            "postalCode": "40320"
          },
          {
            "name": "พระบุ",
            "postalCode": "40320"
          },
          {
            "name": "บ้านโต้น",
            "postalCode": "40320"
          },
          {
            "name": "หนองแวง",
            "postalCode": "40320"
          },
          {
            "name": "ขามป้อม",
            "postalCode": "40320"
          }
        ]
      },
      {
        "name": "หนองเรือ",
        "subDistricts": [
          {
            "name": "หนองเรือ",
            "postalCode": "40210"
          },
          {
            "name": "บ้านเม็ง",
            "postalCode": "40210"
          },
          {
            "name": "บ้านกง",
            "postalCode": "40240"
          },
          {
            "name": "ยางคำ",
            "postalCode": "40240"
          },
          {
            "name": "จระเข้",
            "postalCode": "40240"
          },
          {
            "name": "โนนทอง",
            "postalCode": "40210"
          },
          {
            "name": "กุดกว้าง",
            "postalCode": "40210"
          },
          {
            "name": "โนนทัน",
            "postalCode": "40210"
          },
          {
            "name": "โนนสะอาด",
            "postalCode": "40210"
          },
          {
            "name": "บ้านผือ",
            "postalCode": "40240"
          }
        ]
      },
      {
        "name": "ชุมแพ",
        "subDistricts": [
          {
            "name": "ชุมแพ",
            "postalCode": "40130"
          },
          {
            "name": "โนนหัน",
            "postalCode": "40290"
          },
          {
            "name": "นาหนองทุ่ม",
            "postalCode": "40290"
          },
          {
            "name": "โนนอุดม",
            "postalCode": "40130"
          },
          {
            "name": "ขัวเรียง",
            "postalCode": "40130"
          },
          {
            "name": "หนองไผ่",
            "postalCode": "40130"
          },
          {
            "name": "ไชยสอ",
            "postalCode": "40130"
          },
          {
            "name": "วังหินลาด",
            "postalCode": "40130"
          },
          {
            "name": "นาเพียง",
            "postalCode": "40130"
          },
          {
            "name": "หนองเขียด",
            "postalCode": "40290"
          },
          {
            "name": "หนองเสาเล้า",
            "postalCode": "40130"
          },
          {
            "name": "โนนสะอาด",
            "postalCode": "40290"
          }
        ]
      },
      {
        "name": "สีชมพู",
        "subDistricts": [
          {
            "name": "สีชมพู",
            "postalCode": "40220"
          },
          {
            "name": "ศรีสุข",
            "postalCode": "40220"
          },
          {
            "name": "นาจาน",
            "postalCode": "40220"
          },
          {
            "name": "วังเพิ่ม",
            "postalCode": "40220"
          },
          {
            "name": "ซำยาง",
            "postalCode": "40220"
          },
          {
            "name": "หนองแดง",
            "postalCode": "40220"
          },
          {
            "name": "ดงลาน",
            "postalCode": "40220"
          },
          {
            "name": "บริบูรณ์",
            "postalCode": "40220"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "40220"
          },
          {
            "name": "ภูห่าน",
            "postalCode": "40220"
          }
        ]
      },
      {
        "name": "น้ำพอง",
        "subDistricts": [
          {
            "name": "น้ำพอง",
            "postalCode": "40140"
          },
          {
            "name": "วังชัย",
            "postalCode": "40140"
          },
          {
            "name": "หนองกุง",
            "postalCode": "40140"
          },
          {
            "name": "บัวใหญ่",
            "postalCode": "40140"
          },
          {
            "name": "สะอาด",
            "postalCode": "40310"
          },
          {
            "name": "ม่วงหวาน",
            "postalCode": "40310"
          },
          {
            "name": "บ้านขาม",
            "postalCode": "40140"
          },
          {
            "name": "บัวเงิน",
            "postalCode": "40140"
          },
          {
            "name": "ทรายมูล",
            "postalCode": "40140"
          },
          {
            "name": "ท่ากระเสริม",
            "postalCode": "40140"
          },
          {
            "name": "พังทุย",
            "postalCode": "40140"
          },
          {
            "name": "กุดน้ำใส",
            "postalCode": "40140"
          }
        ]
      },
      {
        "name": "อุบลรัตน์",
        "subDistricts": [
          {
            "name": "โคกสูง",
            "postalCode": "40250"
          },
          {
            "name": "บ้านดง",
            "postalCode": "40250"
          },
          {
            "name": "เขื่อนอุบลรัตน์",
            "postalCode": "40250"
          },
          {
            "name": "นาคำ",
            "postalCode": "40250"
          },
          {
            "name": "ศรีสุขสำราญ",
            "postalCode": "40250"
          },
          {
            "name": "ทุ่งโป่ง",
            "postalCode": "40250"
          }
        ]
      },
      {
        "name": "กระนวน",
        "subDistricts": [
          {
            "name": "หนองโก",
            "postalCode": "40170"
          },
          {
            "name": "หนองกุงใหญ่",
            "postalCode": "40170"
          },
          {
            "name": "ห้วยโจด",
            "postalCode": "40170"
          },
          {
            "name": "ห้วยยาง",
            "postalCode": "40170"
          },
          {
            "name": "บ้านฝาง",
            "postalCode": "40170"
          },
          {
            "name": "ดูนสาด",
            "postalCode": "40170"
          },
          {
            "name": "หนองโน",
            "postalCode": "40170"
          },
          {
            "name": "น้ำอ้อม",
            "postalCode": "40170"
          },
          {
            "name": "หัวนาคำ",
            "postalCode": "40170"
          }
        ]
      },
      {
        "name": "บ้านไผ่",
        "subDistricts": [
          {
            "name": "บ้านไผ่",
            "postalCode": "40110"
          },
          {
            "name": "ในเมือง",
            "postalCode": "40110"
          },
          {
            "name": "เมืองเพีย",
            "postalCode": "40110"
          },
          {
            "name": "บ้านลาน",
            "postalCode": "40110"
          },
          {
            "name": "แคนเหนือ",
            "postalCode": "40110"
          },
          {
            "name": "ภูเหล็ก",
            "postalCode": "40110"
          },
          {
            "name": "ป่าปอ",
            "postalCode": "40110"
          },
          {
            "name": "หินตั้ง",
            "postalCode": "40110"
          },
          {
            "name": "หนองน้ำใส",
            "postalCode": "40110"
          },
          {
            "name": "หัวหนอง",
            "postalCode": "40110"
          }
        ]
      },
      {
        "name": "เปือยน้อย",
        "subDistricts": [
          {
            "name": "เปือยน้อย",
            "postalCode": "40340"
          },
          {
            "name": "วังม่วง",
            "postalCode": "40340"
          },
          {
            "name": "ขามป้อม",
            "postalCode": "40340"
          },
          {
            "name": "สระแก้ว",
            "postalCode": "40340"
          }
        ]
      },
      {
        "name": "พล",
        "subDistricts": [
          {
            "name": "เมืองพล",
            "postalCode": "40120"
          },
          {
            "name": "โจดหนองแก",
            "postalCode": "40120"
          },
          {
            "name": "เก่างิ้ว",
            "postalCode": "40120"
          },
          {
            "name": "หนองมะเขือ",
            "postalCode": "40120"
          },
          {
            "name": "หนองแวงโสกพระ",
            "postalCode": "40120"
          },
          {
            "name": "เพ็กใหญ่",
            "postalCode": "40120"
          },
          {
            "name": "โคกสง่า",
            "postalCode": "40120"
          },
          {
            "name": "หนองแวงนางเบ้า",
            "postalCode": "40120"
          },
          {
            "name": "ลอมคอม",
            "postalCode": "40120"
          },
          {
            "name": "โนนข่า",
            "postalCode": "40120"
          },
          {
            "name": "โสกนกเต็น",
            "postalCode": "40120"
          },
          {
            "name": "หัวทุ่ง",
            "postalCode": "40120"
          }
        ]
      },
      {
        "name": "แวงใหญ่",
        "subDistricts": [
          {
            "name": "คอนฉิม",
            "postalCode": "40330"
          },
          {
            "name": "ใหม่นาเพียง",
            "postalCode": "40330"
          },
          {
            "name": "โนนทอง",
            "postalCode": "40330"
          },
          {
            "name": "แวงใหญ่",
            "postalCode": "40330"
          },
          {
            "name": "โนนสะอาด",
            "postalCode": "40330"
          }
        ]
      },
      {
        "name": "แวงน้อย",
        "subDistricts": [
          {
            "name": "แวงน้อย",
            "postalCode": "40230"
          },
          {
            "name": "ก้านเหลือง",
            "postalCode": "40230"
          },
          {
            "name": "ท่านางแนว",
            "postalCode": "40230"
          },
          {
            "name": "ละหานนา",
            "postalCode": "40230"
          },
          {
            "name": "ท่าวัด",
            "postalCode": "40230"
          },
          {
            "name": "ทางขวาง",
            "postalCode": "40230"
          }
        ]
      },
      {
        "name": "หนองสองห้อง",
        "subDistricts": [
          {
            "name": "หนองสองห้อง",
            "postalCode": "40190"
          },
          {
            "name": "คึมชาด",
            "postalCode": "40190"
          },
          {
            "name": "โนนธาตุ",
            "postalCode": "40190"
          },
          {
            "name": "ตะกั่วป่า",
            "postalCode": "40190"
          },
          {
            "name": "สำโรง",
            "postalCode": "40190"
          },
          {
            "name": "หนองเม็ก",
            "postalCode": "40190"
          },
          {
            "name": "ดอนดู่",
            "postalCode": "40190"
          },
          {
            "name": "ดงเค็ง",
            "postalCode": "40190"
          },
          {
            "name": "หันโจด",
            "postalCode": "40190"
          },
          {
            "name": "ดอนดั่ง",
            "postalCode": "40190"
          },
          {
            "name": "วังหิน",
            "postalCode": "40190"
          },
          {
            "name": "หนองไผ่ล้อม",
            "postalCode": "40190"
          }
        ]
      },
      {
        "name": "ภูเวียง",
        "subDistricts": [
          {
            "name": "บ้านเรือ",
            "postalCode": "40150"
          },
          {
            "name": "หว้าทอง",
            "postalCode": "40150"
          },
          {
            "name": "กุดขอนแก่น",
            "postalCode": "40150"
          },
          {
            "name": "นาชุมแสง",
            "postalCode": "40150"
          },
          {
            "name": "นาหว้า",
            "postalCode": "40150"
          },
          {
            "name": "หนองกุงธนสาร",
            "postalCode": "40150"
          },
          {
            "name": "หนองกุงเซิน",
            "postalCode": "40150"
          },
          {
            "name": "สงเปือย",
            "postalCode": "40150"
          },
          {
            "name": "ทุ่งชมพู",
            "postalCode": "40150"
          },
          {
            "name": "ดินดำ",
            "postalCode": "40150"
          },
          {
            "name": "ภูเวียง",
            "postalCode": "40150"
          }
        ]
      },
      {
        "name": "มัญจาคีรี",
        "subDistricts": [
          {
            "name": "กุดเค้า",
            "postalCode": "40160"
          },
          {
            "name": "สวนหม่อน",
            "postalCode": "40160"
          },
          {
            "name": "หนองแปน",
            "postalCode": "40160"
          },
          {
            "name": "โพนเพ็ก",
            "postalCode": "40160"
          },
          {
            "name": "คำแคน",
            "postalCode": "40160"
          },
          {
            "name": "นาข่า",
            "postalCode": "40160"
          },
          {
            "name": "นางาม",
            "postalCode": "40160"
          },
          {
            "name": "ท่าศาลา",
            "postalCode": "40160"
          }
        ]
      },
      {
        "name": "ชนบท",
        "subDistricts": [
          {
            "name": "ชนบท",
            "postalCode": "40180"
          },
          {
            "name": "กุดเพียขอม",
            "postalCode": "40180"
          },
          {
            "name": "วังแสง",
            "postalCode": "40180"
          },
          {
            "name": "ห้วยแก",
            "postalCode": "40180"
          },
          {
            "name": "บ้านแท่น",
            "postalCode": "40180"
          },
          {
            "name": "ศรีบุญเรือง",
            "postalCode": "40180"
          },
          {
            "name": "โนนพะยอม",
            "postalCode": "40180"
          },
          {
            "name": "ปอแดง",
            "postalCode": "40180"
          }
        ]
      },
      {
        "name": "เขาสวนกวาง",
        "subDistricts": [
          {
            "name": "เขาสวนกวาง",
            "postalCode": "40280"
          },
          {
            "name": "ดงเมืองแอม",
            "postalCode": "40280"
          },
          {
            "name": "นางิ้ว",
            "postalCode": "40280"
          },
          {
            "name": "โนนสมบูรณ์",
            "postalCode": "40280"
          },
          {
            "name": "คำม่วง",
            "postalCode": "40280"
          }
        ]
      },
      {
        "name": "ภูผาม่าน",
        "subDistricts": [
          {
            "name": "โนนคอม",
            "postalCode": "40350"
          },
          {
            "name": "นาฝาย",
            "postalCode": "40350"
          },
          {
            "name": "ภูผาม่าน",
            "postalCode": "40350"
          },
          {
            "name": "วังสวาบ",
            "postalCode": "40350"
          },
          {
            "name": "ห้วยม่วง",
            "postalCode": "40350"
          }
        ]
      },
      {
        "name": "ซำสูง",
        "subDistricts": [
          {
            "name": "กระนวน",
            "postalCode": "40170"
          },
          {
            "name": "คำแมด",
            "postalCode": "40170"
          },
          {
            "name": "บ้านโนน",
            "postalCode": "40170"
          },
          {
            "name": "คูคำ",
            "postalCode": "40170"
          },
          {
            "name": "ห้วยเตย",
            "postalCode": "40170"
          }
        ]
      },
      {
        "name": "โคกโพธิ์ไชย",
        "subDistricts": [
          {
            "name": "บ้านโคก",
            "postalCode": "40160"
          },
          {
            "name": "โพธิ์ไชย",
            "postalCode": "40160"
          },
          {
            "name": "ซับสมบูรณ์",
            "postalCode": "40160"
          },
          {
            "name": "นาแพง",
            "postalCode": "40160"
          }
        ]
      },
      {
        "name": "หนองนาคำ",
        "subDistricts": [
          {
            "name": "กุดธาตุ",
            "postalCode": "40150"
          },
          {
            "name": "บ้านโคก",
            "postalCode": "40150"
          },
          {
            "name": "ขนวน",
            "postalCode": "40150"
          }
        ]
      },
      {
        "name": "บ้านแฮด",
        "subDistricts": [
          {
            "name": "บ้านแฮด",
            "postalCode": "40110"
          },
          {
            "name": "โคกสำราญ",
            "postalCode": "40110"
          },
          {
            "name": "โนนสมบูรณ์",
            "postalCode": "40110"
          },
          {
            "name": "หนองแซง",
            "postalCode": "40110"
          }
        ]
      },
      {
        "name": "โนนศิลา",
        "subDistricts": [
          {
            "name": "โนนศิลา",
            "postalCode": "40110"
          },
          {
            "name": "หนองปลาหมอ",
            "postalCode": "40110"
          },
          {
            "name": "บ้านหัน",
            "postalCode": "40110"
          },
          {
            "name": "เปือยใหญ่",
            "postalCode": "40110"
          },
          {
            "name": "โนนแดง",
            "postalCode": "40110"
          }
        ]
      },
      {
        "name": "เวียงเก่า",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "40150"
          },
          {
            "name": "เมืองเก่าพัฒนา",
            "postalCode": "40150"
          },
          {
            "name": "เขาน้อย",
            "postalCode": "40150"
          }
        ]
      }
    ]
  },
  {
    "name": "อุดรธานี",
    "districts": [
      {
        "name": "เมืองอุดรธานี",
        "subDistricts": [
          {
            "name": "หมากแข้ง",
            "postalCode": "41000"
          },
          {
            "name": "นิคมสงเคราะห์",
            "postalCode": "41000"
          },
          {
            "name": "บ้านขาว",
            "postalCode": "41000"
          },
          {
            "name": "หนองบัว",
            "postalCode": "41000"
          },
          {
            "name": "บ้านตาด",
            "postalCode": "41000"
          },
          {
            "name": "โนนสูง",
            "postalCode": "41330"
          },
          {
            "name": "หมูม่น",
            "postalCode": "41000"
          },
          {
            "name": "เชียงยืน",
            "postalCode": "41000"
          },
          {
            "name": "หนองนาคำ",
            "postalCode": "41000"
          },
          {
            "name": "กุดสระ",
            "postalCode": "41000"
          },
          {
            "name": "นาดี",
            "postalCode": "41000"
          },
          {
            "name": "บ้านเลื่อม",
            "postalCode": "41000"
          },
          {
            "name": "เชียงพิณ",
            "postalCode": "41000"
          },
          {
            "name": "สามพร้าว",
            "postalCode": "41000"
          },
          {
            "name": "หนองไฮ",
            "postalCode": "41000"
          },
          {
            "name": "นาข่า",
            "postalCode": "41000"
          },
          {
            "name": "บ้านจั่น",
            "postalCode": "41000"
          },
          {
            "name": "หนองขอนกว้าง",
            "postalCode": "41000"
          },
          {
            "name": "โคกสะอาด",
            "postalCode": "41000"
          },
          {
            "name": "นากว้าง",
            "postalCode": "41000"
          },
          {
            "name": "หนองไผ่",
            "postalCode": "41330"
          }
        ]
      },
      {
        "name": "กุดจับ",
        "subDistricts": [
          {
            "name": "กุดจับ",
            "postalCode": "41250"
          },
          {
            "name": "ปะโค",
            "postalCode": "41250"
          },
          {
            "name": "ขอนยูง",
            "postalCode": "41250"
          },
          {
            "name": "เชียงเพ็ง",
            "postalCode": "41250"
          },
          {
            "name": "สร้างก่อ",
            "postalCode": "41250"
          },
          {
            "name": "เมืองเพีย",
            "postalCode": "41250"
          },
          {
            "name": "ตาลเลียน",
            "postalCode": "41250"
          }
        ]
      },
      {
        "name": "หนองวัวซอ",
        "subDistricts": [
          {
            "name": "หมากหญ้า",
            "postalCode": "41360"
          },
          {
            "name": "หนองอ้อ",
            "postalCode": "41220"
          },
          {
            "name": "อูบมุง",
            "postalCode": "41220"
          },
          {
            "name": "กุดหมากไฟ",
            "postalCode": "41220"
          },
          {
            "name": "น้ำพ่น",
            "postalCode": "41360"
          },
          {
            "name": "หนองบัวบาน",
            "postalCode": "41360"
          },
          {
            "name": "โนนหวาย",
            "postalCode": "41220"
          },
          {
            "name": "หนองวัวซอ",
            "postalCode": "41360"
          }
        ]
      },
      {
        "name": "กุมภวาปี",
        "subDistricts": [
          {
            "name": "ตูมใต้",
            "postalCode": "41110"
          },
          {
            "name": "พันดอน",
            "postalCode": "41370"
          },
          {
            "name": "เวียงคำ",
            "postalCode": "41110"
          },
          {
            "name": "แชแล",
            "postalCode": "41110"
          },
          {
            "name": "เชียงแหว",
            "postalCode": "41110"
          },
          {
            "name": "ห้วยเกิ้ง",
            "postalCode": "41110"
          },
          {
            "name": "เสอเพลอ",
            "postalCode": "41370"
          },
          {
            "name": "สีออ",
            "postalCode": "41110"
          },
          {
            "name": "ปะโค",
            "postalCode": "41370"
          },
          {
            "name": "ผาสุก",
            "postalCode": "41370"
          },
          {
            "name": "ท่าลี่",
            "postalCode": "41110"
          },
          {
            "name": "กุมภวาปี",
            "postalCode": "41110"
          },
          {
            "name": "หนองหว้า",
            "postalCode": "41110"
          }
        ]
      },
      {
        "name": "โนนสะอาด",
        "subDistricts": [
          {
            "name": "โนนสะอาด",
            "postalCode": "41240"
          },
          {
            "name": "บุ่งแก้ว",
            "postalCode": "41240"
          },
          {
            "name": "โพธิ์ศรีสำราญ",
            "postalCode": "41240"
          },
          {
            "name": "ทมนางาม",
            "postalCode": "41240"
          },
          {
            "name": "หนองกุงศรี",
            "postalCode": "41240"
          },
          {
            "name": "โคกกลาง",
            "postalCode": "41240"
          }
        ]
      },
      {
        "name": "หนองหาน",
        "subDistricts": [
          {
            "name": "หนองหาน",
            "postalCode": "41130"
          },
          {
            "name": "หนองเม็ก",
            "postalCode": "41130"
          },
          {
            "name": "พังงู",
            "postalCode": "41130"
          },
          {
            "name": "สะแบง",
            "postalCode": "41130"
          },
          {
            "name": "สร้อยพร้าว",
            "postalCode": "41130"
          },
          {
            "name": "บ้านเชียง",
            "postalCode": "41320"
          },
          {
            "name": "บ้านยา",
            "postalCode": "41320"
          },
          {
            "name": "โพนงาม",
            "postalCode": "41130"
          },
          {
            "name": "ผักตบ",
            "postalCode": "41130"
          },
          {
            "name": "หนองไผ่",
            "postalCode": "41130"
          },
          {
            "name": "ดอนหายโศก",
            "postalCode": "41130"
          },
          {
            "name": "หนองสระปลา",
            "postalCode": "41320"
          }
        ]
      },
      {
        "name": "ทุ่งฝน",
        "subDistricts": [
          {
            "name": "ทุ่งฝน",
            "postalCode": "41310"
          },
          {
            "name": "ทุ่งใหญ่",
            "postalCode": "41310"
          },
          {
            "name": "นาชุมแสง",
            "postalCode": "41310"
          },
          {
            "name": "นาทม",
            "postalCode": "41310"
          }
        ]
      },
      {
        "name": "ไชยวาน",
        "subDistricts": [
          {
            "name": "ไชยวาน",
            "postalCode": "41290"
          },
          {
            "name": "หนองหลัก",
            "postalCode": "41290"
          },
          {
            "name": "คำเลาะ",
            "postalCode": "41290"
          },
          {
            "name": "โพนสูง",
            "postalCode": "41290"
          }
        ]
      },
      {
        "name": "ศรีธาตุ",
        "subDistricts": [
          {
            "name": "ศรีธาตุ",
            "postalCode": "41230"
          },
          {
            "name": "จำปี",
            "postalCode": "41230"
          },
          {
            "name": "บ้านโปร่ง",
            "postalCode": "41230"
          },
          {
            "name": "หัวนาคำ",
            "postalCode": "41230"
          },
          {
            "name": "หนองนกเขียน",
            "postalCode": "41230"
          },
          {
            "name": "นายูง",
            "postalCode": "41230"
          },
          {
            "name": "ตาดทอง",
            "postalCode": "41230"
          }
        ]
      },
      {
        "name": "วังสามหมอ",
        "subDistricts": [
          {
            "name": "หนองกุงทับม้า",
            "postalCode": "41280"
          },
          {
            "name": "หนองหญ้าไซ",
            "postalCode": "41280"
          },
          {
            "name": "บะยาว",
            "postalCode": "41280"
          },
          {
            "name": "ผาสุก",
            "postalCode": "41280"
          },
          {
            "name": "คำโคกสูง",
            "postalCode": "41280"
          },
          {
            "name": "วังสามหมอ",
            "postalCode": "41280"
          }
        ]
      },
      {
        "name": "บ้านดุง",
        "subDistricts": [
          {
            "name": "ศรีสุทโธ",
            "postalCode": "41190"
          },
          {
            "name": "บ้านดุง",
            "postalCode": "41190"
          },
          {
            "name": "ดงเย็น",
            "postalCode": "41190"
          },
          {
            "name": "โพนสูง",
            "postalCode": "41190"
          },
          {
            "name": "อ้อมกอ",
            "postalCode": "41190"
          },
          {
            "name": "บ้านจันทน์",
            "postalCode": "41190"
          },
          {
            "name": "บ้านชัย",
            "postalCode": "41190"
          },
          {
            "name": "นาไหม",
            "postalCode": "41190"
          },
          {
            "name": "ถ่อนนาลับ",
            "postalCode": "41190"
          },
          {
            "name": "วังทอง",
            "postalCode": "41190"
          },
          {
            "name": "บ้านม่วง",
            "postalCode": "41190"
          },
          {
            "name": "บ้านตาด",
            "postalCode": "41190"
          },
          {
            "name": "นาคำ",
            "postalCode": "41190"
          }
        ]
      },
      {
        "name": "บ้านผือ",
        "subDistricts": [
          {
            "name": "บ้านผือ",
            "postalCode": "41160"
          },
          {
            "name": "หายโศก",
            "postalCode": "41160"
          },
          {
            "name": "เขือน้ำ",
            "postalCode": "41160"
          },
          {
            "name": "คำบง",
            "postalCode": "41160"
          },
          {
            "name": "โนนทอง",
            "postalCode": "41160"
          },
          {
            "name": "ข้าวสาร",
            "postalCode": "41160"
          },
          {
            "name": "จำปาโมง",
            "postalCode": "41160"
          },
          {
            "name": "กลางใหญ่",
            "postalCode": "41160"
          },
          {
            "name": "เมืองพาน",
            "postalCode": "41160"
          },
          {
            "name": "คำด้วง",
            "postalCode": "41160"
          },
          {
            "name": "หนองหัวคู",
            "postalCode": "41160"
          },
          {
            "name": "บ้านค้อ",
            "postalCode": "41160"
          },
          {
            "name": "หนองแวง",
            "postalCode": "41160"
          }
        ]
      },
      {
        "name": "น้ำโสม",
        "subDistricts": [
          {
            "name": "นางัว",
            "postalCode": "41210"
          },
          {
            "name": "น้ำโสม",
            "postalCode": "41210"
          },
          {
            "name": "หนองแวง",
            "postalCode": "41210"
          },
          {
            "name": "บ้านหยวก",
            "postalCode": "41210"
          },
          {
            "name": "โสมเยี่ยม",
            "postalCode": "41210"
          },
          {
            "name": "ศรีสำราญ",
            "postalCode": "41210"
          },
          {
            "name": "สามัคคี",
            "postalCode": "41210"
          }
        ]
      },
      {
        "name": "เพ็ญ",
        "subDistricts": [
          {
            "name": "เพ็ญ",
            "postalCode": "41150"
          },
          {
            "name": "บ้านธาตุ",
            "postalCode": "41150"
          },
          {
            "name": "นาพู่",
            "postalCode": "41150"
          },
          {
            "name": "เชียงหวาง",
            "postalCode": "41150"
          },
          {
            "name": "สุมเส้า",
            "postalCode": "41150"
          },
          {
            "name": "นาบัว",
            "postalCode": "41150"
          },
          {
            "name": "บ้านเหล่า",
            "postalCode": "41150"
          },
          {
            "name": "จอมศรี",
            "postalCode": "41150"
          },
          {
            "name": "เตาไห",
            "postalCode": "41150"
          },
          {
            "name": "โคกกลาง",
            "postalCode": "41150"
          },
          {
            "name": "สร้างแป้น",
            "postalCode": "41150"
          }
        ]
      },
      {
        "name": "สร้างคอม",
        "subDistricts": [
          {
            "name": "สร้างคอม",
            "postalCode": "41260"
          },
          {
            "name": "เชียงดา",
            "postalCode": "41260"
          },
          {
            "name": "บ้านยวด",
            "postalCode": "41260"
          },
          {
            "name": "บ้านโคก",
            "postalCode": "41260"
          },
          {
            "name": "นาสะอาด",
            "postalCode": "41260"
          },
          {
            "name": "บ้านหินโงม",
            "postalCode": "41260"
          }
        ]
      },
      {
        "name": "หนองแสง",
        "subDistricts": [
          {
            "name": "หนองแสง",
            "postalCode": "41340"
          },
          {
            "name": "แสงสว่าง",
            "postalCode": "41340"
          },
          {
            "name": "นาดี",
            "postalCode": "41340"
          },
          {
            "name": "ทับกุง",
            "postalCode": "41340"
          }
        ]
      },
      {
        "name": "นายูง",
        "subDistricts": [
          {
            "name": "นายูง",
            "postalCode": "41380"
          },
          {
            "name": "บ้านก้อง",
            "postalCode": "41380"
          },
          {
            "name": "นาแค",
            "postalCode": "41380"
          },
          {
            "name": "โนนทอง",
            "postalCode": "41380"
          }
        ]
      },
      {
        "name": "พิบูลย์รักษ์",
        "subDistricts": [
          {
            "name": "บ้านแดง",
            "postalCode": "41130"
          },
          {
            "name": "นาทราย",
            "postalCode": "41130"
          },
          {
            "name": "ดอนกลอย",
            "postalCode": "41130"
          }
        ]
      },
      {
        "name": "กู่แก้ว",
        "subDistricts": [
          {
            "name": "บ้านจีต",
            "postalCode": "41130"
          },
          {
            "name": "โนนทองอินทร์",
            "postalCode": "41130"
          },
          {
            "name": "ค้อใหญ่",
            "postalCode": "41130"
          },
          {
            "name": "คอนสาย",
            "postalCode": "41130"
          }
        ]
      },
      {
        "name": "ประจักษ์ศิลปาคม",
        "subDistricts": [
          {
            "name": "นาม่วง",
            "postalCode": "41110"
          },
          {
            "name": "ห้วยสามพาด",
            "postalCode": "41110"
          },
          {
            "name": "อุ่มจาน",
            "postalCode": "41110"
          }
        ]
      }
    ]
  },
  {
    "name": "เลย",
    "districts": [
      {
        "name": "เมืองเลย",
        "subDistricts": [
          {
            "name": "กุดป่อง",
            "postalCode": "42000"
          },
          {
            "name": "เมือง",
            "postalCode": "42000"
          },
          {
            "name": "นาอ้อ",
            "postalCode": "42100"
          },
          {
            "name": "กกดู่",
            "postalCode": "42000"
          },
          {
            "name": "น้ำหมาน",
            "postalCode": "42000"
          },
          {
            "name": "เสี้ยว",
            "postalCode": "42000"
          },
          {
            "name": "นาอาน",
            "postalCode": "42000"
          },
          {
            "name": "นาโป่ง",
            "postalCode": "42000"
          },
          {
            "name": "นาดินดำ",
            "postalCode": "42000"
          },
          {
            "name": "น้ำสวย",
            "postalCode": "42000"
          },
          {
            "name": "ชัยพฤกษ์",
            "postalCode": "42000"
          },
          {
            "name": "นาแขม",
            "postalCode": "42000"
          },
          {
            "name": "ศรีสองรัก",
            "postalCode": "42100"
          },
          {
            "name": "กกทอง",
            "postalCode": "42000"
          }
        ]
      },
      {
        "name": "นาด้วง",
        "subDistricts": [
          {
            "name": "นาด้วง",
            "postalCode": "42210"
          },
          {
            "name": "นาดอกคำ",
            "postalCode": "42210"
          },
          {
            "name": "ท่าสะอาด",
            "postalCode": "42210"
          },
          {
            "name": "ท่าสวรรค์",
            "postalCode": "42210"
          }
        ]
      },
      {
        "name": "เชียงคาน",
        "subDistricts": [
          {
            "name": "เชียงคาน",
            "postalCode": "42110"
          },
          {
            "name": "ธาตุ",
            "postalCode": "42110"
          },
          {
            "name": "นาซ่าว",
            "postalCode": "42110"
          },
          {
            "name": "เขาแก้ว",
            "postalCode": "42110"
          },
          {
            "name": "ปากตม",
            "postalCode": "42110"
          },
          {
            "name": "บุฮม",
            "postalCode": "42110"
          },
          {
            "name": "จอมศรี",
            "postalCode": "42110"
          },
          {
            "name": "หาดทรายขาว",
            "postalCode": "42110"
          }
        ]
      },
      {
        "name": "ปากชม",
        "subDistricts": [
          {
            "name": "ปากชม",
            "postalCode": "42150"
          },
          {
            "name": "เชียงกลม",
            "postalCode": "42150"
          },
          {
            "name": "หาดคัมภีร์",
            "postalCode": "42150"
          },
          {
            "name": "ห้วยบ่อซืน",
            "postalCode": "42150"
          },
          {
            "name": "ห้วยพิชัย",
            "postalCode": "42150"
          },
          {
            "name": "ชมเจริญ",
            "postalCode": "42150"
          }
        ]
      },
      {
        "name": "ด่านซ้าย",
        "subDistricts": [
          {
            "name": "ด่านซ้าย",
            "postalCode": "42120"
          },
          {
            "name": "ปากหมัน",
            "postalCode": "42120"
          },
          {
            "name": "นาดี",
            "postalCode": "42120"
          },
          {
            "name": "โคกงาม",
            "postalCode": "42120"
          },
          {
            "name": "โพนสูง",
            "postalCode": "42120"
          },
          {
            "name": "อิปุ่ม",
            "postalCode": "42120"
          },
          {
            "name": "กกสะทอน",
            "postalCode": "42120"
          },
          {
            "name": "โป่ง",
            "postalCode": "42120"
          },
          {
            "name": "วังยาว",
            "postalCode": "42120"
          },
          {
            "name": "นาหอ",
            "postalCode": "42120"
          }
        ]
      },
      {
        "name": "นาแห้ว",
        "subDistricts": [
          {
            "name": "นาแห้ว",
            "postalCode": "42170"
          },
          {
            "name": "แสงภา",
            "postalCode": "42170"
          },
          {
            "name": "นาพึง",
            "postalCode": "42170"
          },
          {
            "name": "นามาลา",
            "postalCode": "42170"
          },
          {
            "name": "เหล่ากอหก",
            "postalCode": "42170"
          }
        ]
      },
      {
        "name": "ภูเรือ",
        "subDistricts": [
          {
            "name": "หนองบัว",
            "postalCode": "42160"
          },
          {
            "name": "ท่าศาลา",
            "postalCode": "42160"
          },
          {
            "name": "ร่องจิก",
            "postalCode": "42160"
          },
          {
            "name": "ปลาบ่า",
            "postalCode": "42160"
          },
          {
            "name": "ลาดค่าง",
            "postalCode": "42160"
          },
          {
            "name": "สานตม",
            "postalCode": "42160"
          }
        ]
      },
      {
        "name": "ท่าลี่",
        "subDistricts": [
          {
            "name": "ท่าลี่",
            "postalCode": "42140"
          },
          {
            "name": "หนองผือ",
            "postalCode": "42140"
          },
          {
            "name": "อาฮี",
            "postalCode": "42140"
          },
          {
            "name": "น้ำแคม",
            "postalCode": "42140"
          },
          {
            "name": "โคกใหญ่",
            "postalCode": "42140"
          },
          {
            "name": "น้ำทูน",
            "postalCode": "42140"
          }
        ]
      },
      {
        "name": "วังสะพุง",
        "subDistricts": [
          {
            "name": "วังสะพุง",
            "postalCode": "42130"
          },
          {
            "name": "ทรายขาว",
            "postalCode": "42130"
          },
          {
            "name": "หนองหญ้าปล้อง",
            "postalCode": "42130"
          },
          {
            "name": "หนองงิ้ว",
            "postalCode": "42130"
          },
          {
            "name": "ปากปวน",
            "postalCode": "42130"
          },
          {
            "name": "ผาน้อย",
            "postalCode": "42130"
          },
          {
            "name": "ผาบิ้ง",
            "postalCode": "42130"
          },
          {
            "name": "เขาหลวง",
            "postalCode": "42130"
          },
          {
            "name": "โคกขมิ้น",
            "postalCode": "42130"
          },
          {
            "name": "ศรีสงคราม",
            "postalCode": "42130"
          }
        ]
      },
      {
        "name": "ภูกระดึง",
        "subDistricts": [
          {
            "name": "ศรีฐาน",
            "postalCode": "42180"
          },
          {
            "name": "ผานกเค้า",
            "postalCode": "42180"
          },
          {
            "name": "ภูกระดึง",
            "postalCode": "42180"
          },
          {
            "name": "ห้วยส้ม",
            "postalCode": "42180"
          }
        ]
      },
      {
        "name": "ภูหลวง",
        "subDistricts": [
          {
            "name": "ภูหอ",
            "postalCode": "42230"
          },
          {
            "name": "หนองคัน",
            "postalCode": "42230"
          },
          {
            "name": "ห้วยสีเสียด",
            "postalCode": "42230"
          },
          {
            "name": "เลยวังไสย์",
            "postalCode": "42230"
          },
          {
            "name": "แก่งศรีภูมิ",
            "postalCode": "42230"
          }
        ]
      },
      {
        "name": "ผาขาว",
        "subDistricts": [
          {
            "name": "ผาขาว",
            "postalCode": "42240"
          },
          {
            "name": "ท่าช้างคล้อง",
            "postalCode": "42240"
          },
          {
            "name": "โนนปอแดง",
            "postalCode": "42240"
          },
          {
            "name": "โนนป่าซาง",
            "postalCode": "42240"
          },
          {
            "name": "บ้านเพิ่ม",
            "postalCode": "42240"
          }
        ]
      },
      {
        "name": "เอราวัณ",
        "subDistricts": [
          {
            "name": "เอราวัณ",
            "postalCode": "42220"
          },
          {
            "name": "ผาอินทร์แปลง",
            "postalCode": "42220"
          },
          {
            "name": "ผาสามยอด",
            "postalCode": "42220"
          },
          {
            "name": "ทรัพย์ไพวัลย์",
            "postalCode": "42220"
          }
        ]
      },
      {
        "name": "หนองหิน",
        "subDistricts": [
          {
            "name": "หนองหิน",
            "postalCode": "42190"
          },
          {
            "name": "ตาดข่า",
            "postalCode": "42190"
          },
          {
            "name": "ปวนพุ",
            "postalCode": "42190"
          }
        ]
      }
    ]
  },
  {
    "name": "หนองคาย",
    "districts": [
      {
        "name": "เมืองหนองคาย",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "43000"
          },
          {
            "name": "มีชัย",
            "postalCode": "43000"
          },
          {
            "name": "โพธิ์ชัย",
            "postalCode": "43000"
          },
          {
            "name": "กวนวัน",
            "postalCode": "43000"
          },
          {
            "name": "เวียงคุก",
            "postalCode": "43000"
          },
          {
            "name": "วัดธาตุ",
            "postalCode": "43000"
          },
          {
            "name": "หาดคำ",
            "postalCode": "43000"
          },
          {
            "name": "หินโงม",
            "postalCode": "43000"
          },
          {
            "name": "บ้านเดื่อ",
            "postalCode": "43000"
          },
          {
            "name": "ค่ายบกหวาน",
            "postalCode": "43100"
          },
          {
            "name": "สองห้อง",
            "postalCode": "43100"
          },
          {
            "name": "พระธาตุบังพวน",
            "postalCode": "43100"
          },
          {
            "name": "หนองกอมเกาะ",
            "postalCode": "43000"
          },
          {
            "name": "ปะโค",
            "postalCode": "43000"
          },
          {
            "name": "เมืองหมี",
            "postalCode": "43000"
          },
          {
            "name": "สีกาย",
            "postalCode": "43000"
          }
        ]
      },
      {
        "name": "ท่าบ่อ",
        "subDistricts": [
          {
            "name": "ท่าบ่อ",
            "postalCode": "43110"
          },
          {
            "name": "น้ำโมง",
            "postalCode": "43110"
          },
          {
            "name": "กองนาง",
            "postalCode": "43110"
          },
          {
            "name": "โคกคอน",
            "postalCode": "43110"
          },
          {
            "name": "บ้านเดื่อ",
            "postalCode": "43110"
          },
          {
            "name": "บ้านถ่อน",
            "postalCode": "43110"
          },
          {
            "name": "บ้านว่าน",
            "postalCode": "43110"
          },
          {
            "name": "นาข่า",
            "postalCode": "43110"
          },
          {
            "name": "โพนสา",
            "postalCode": "43110"
          },
          {
            "name": "หนองนาง",
            "postalCode": "43110"
          }
        ]
      },
      {
        "name": "โพนพิสัย",
        "subDistricts": [
          {
            "name": "จุมพล",
            "postalCode": "43120"
          },
          {
            "name": "วัดหลวง",
            "postalCode": "43120"
          },
          {
            "name": "กุดบง",
            "postalCode": "43120"
          },
          {
            "name": "ชุมช้าง",
            "postalCode": "43120"
          },
          {
            "name": "ทุ่งหลวง",
            "postalCode": "43120"
          },
          {
            "name": "เหล่าต่างคำ",
            "postalCode": "43120"
          },
          {
            "name": "นาหนัง",
            "postalCode": "43120"
          },
          {
            "name": "เซิม",
            "postalCode": "43120"
          },
          {
            "name": "บ้านโพธิ์",
            "postalCode": "43120"
          },
          {
            "name": "บ้านผือ",
            "postalCode": "43120"
          },
          {
            "name": "สร้างนางขาว",
            "postalCode": "43120"
          }
        ]
      },
      {
        "name": "ศรีเชียงใหม่",
        "subDistricts": [
          {
            "name": "พานพร้าว",
            "postalCode": "43130"
          },
          {
            "name": "บ้านหม้อ",
            "postalCode": "43130"
          },
          {
            "name": "พระพุทธบาท",
            "postalCode": "43130"
          },
          {
            "name": "หนองปลาปาก",
            "postalCode": "43130"
          }
        ]
      },
      {
        "name": "สังคม",
        "subDistricts": [
          {
            "name": "แก้งไก่",
            "postalCode": "43160"
          },
          {
            "name": "ผาตั้ง",
            "postalCode": "43160"
          },
          {
            "name": "บ้านม่วง",
            "postalCode": "43160"
          },
          {
            "name": "นางิ้ว",
            "postalCode": "43160"
          },
          {
            "name": "สังคม",
            "postalCode": "43160"
          }
        ]
      },
      {
        "name": "สระใคร",
        "subDistricts": [
          {
            "name": "สระใคร",
            "postalCode": "43100"
          },
          {
            "name": "คอกช้าง",
            "postalCode": "43100"
          },
          {
            "name": "บ้านฝาง",
            "postalCode": "43100"
          }
        ]
      },
      {
        "name": "เฝ้าไร่",
        "subDistricts": [
          {
            "name": "เฝ้าไร่",
            "postalCode": "43120"
          },
          {
            "name": "นาดี",
            "postalCode": "43120"
          },
          {
            "name": "หนองหลวง",
            "postalCode": "43120"
          },
          {
            "name": "วังหลวง",
            "postalCode": "43120"
          },
          {
            "name": "อุดมพร",
            "postalCode": "43120"
          }
        ]
      },
      {
        "name": "รัตนวาปี",
        "subDistricts": [
          {
            "name": "รัตนวาปี",
            "postalCode": "43120"
          },
          {
            "name": "นาทับไฮ",
            "postalCode": "43120"
          },
          {
            "name": "บ้านต้อน",
            "postalCode": "43120"
          },
          {
            "name": "พระบาทนาสิงห์",
            "postalCode": "43120"
          },
          {
            "name": "โพนแพง",
            "postalCode": "43120"
          }
        ]
      },
      {
        "name": "โพธิ์ตาก",
        "subDistricts": [
          {
            "name": "โพธิ์ตาก",
            "postalCode": "43130"
          },
          {
            "name": "โพนทอง",
            "postalCode": "43130"
          },
          {
            "name": "ด่านศรีสุข",
            "postalCode": "43130"
          }
        ]
      }
    ]
  },
  {
    "name": "มหาสารคาม",
    "districts": [
      {
        "name": "เมืองมหาสารคาม",
        "subDistricts": [
          {
            "name": "ตลาด",
            "postalCode": "44000"
          },
          {
            "name": "เขวา",
            "postalCode": "44000"
          },
          {
            "name": "ท่าตูม",
            "postalCode": "44000"
          },
          {
            "name": "แวงน่าง",
            "postalCode": "44000"
          },
          {
            "name": "โคกก่อ",
            "postalCode": "44000"
          },
          {
            "name": "ดอนหว่าน",
            "postalCode": "44000"
          },
          {
            "name": "เกิ้ง",
            "postalCode": "44000"
          },
          {
            "name": "แก่งเลิงจาน",
            "postalCode": "44000"
          },
          {
            "name": "ท่าสองคอน",
            "postalCode": "44000"
          },
          {
            "name": "ลาดพัฒนา",
            "postalCode": "44000"
          },
          {
            "name": "หนองปลิง",
            "postalCode": "44000"
          },
          {
            "name": "ห้วยแอ่ง",
            "postalCode": "44000"
          },
          {
            "name": "หนองโน",
            "postalCode": "44000"
          },
          {
            "name": "บัวค้อ",
            "postalCode": "44000"
          }
        ]
      },
      {
        "name": "แกดำ",
        "subDistricts": [
          {
            "name": "แกดำ",
            "postalCode": "44190"
          },
          {
            "name": "วังแสง",
            "postalCode": "44190"
          },
          {
            "name": "มิตรภาพ",
            "postalCode": "44190"
          },
          {
            "name": "หนองกุง",
            "postalCode": "44190"
          },
          {
            "name": "โนนภิบาล",
            "postalCode": "44190"
          }
        ]
      },
      {
        "name": "โกสุมพิสัย",
        "subDistricts": [
          {
            "name": "หัวขวาง",
            "postalCode": "44140"
          },
          {
            "name": "ยางน้อย",
            "postalCode": "44140"
          },
          {
            "name": "วังยาว",
            "postalCode": "44140"
          },
          {
            "name": "เขวาไร่",
            "postalCode": "44140"
          },
          {
            "name": "แพง",
            "postalCode": "44140"
          },
          {
            "name": "แก้งแก",
            "postalCode": "44140"
          },
          {
            "name": "หนองเหล็ก",
            "postalCode": "44140"
          },
          {
            "name": "หนองบัว",
            "postalCode": "44140"
          },
          {
            "name": "เหล่า",
            "postalCode": "44140"
          },
          {
            "name": "เขื่อน",
            "postalCode": "44140"
          },
          {
            "name": "หนองบอน",
            "postalCode": "44140"
          },
          {
            "name": "โพนงาม",
            "postalCode": "44140"
          },
          {
            "name": "ยางท่าแจ้ง",
            "postalCode": "44140"
          },
          {
            "name": "แห่ใต้",
            "postalCode": "44140"
          },
          {
            "name": "หนองกุงสวรรค์",
            "postalCode": "44140"
          },
          {
            "name": "เลิงใต้",
            "postalCode": "44140"
          },
          {
            "name": "ดอนกลาง",
            "postalCode": "44140"
          }
        ]
      },
      {
        "name": "กันทรวิชัย",
        "subDistricts": [
          {
            "name": "โคกพระ",
            "postalCode": "44150"
          },
          {
            "name": "คันธารราษฎร์",
            "postalCode": "44150"
          },
          {
            "name": "มะค่า",
            "postalCode": "44150"
          },
          {
            "name": "ท่าขอนยาง",
            "postalCode": "44150"
          },
          {
            "name": "นาสีนวน",
            "postalCode": "44150"
          },
          {
            "name": "ขามเรียง",
            "postalCode": "44150"
          },
          {
            "name": "เขวาใหญ่",
            "postalCode": "44150"
          },
          {
            "name": "ศรีสุข",
            "postalCode": "44150"
          },
          {
            "name": "กุดใส้จ่อ",
            "postalCode": "44150"
          },
          {
            "name": "ขามเฒ่าพัฒนา",
            "postalCode": "44150"
          }
        ]
      },
      {
        "name": "เชียงยืน",
        "subDistricts": [
          {
            "name": "เชียงยืน",
            "postalCode": "44160"
          },
          {
            "name": "หนองซอน",
            "postalCode": "44160"
          },
          {
            "name": "ดอนเงิน",
            "postalCode": "44160"
          },
          {
            "name": "กู่ทอง",
            "postalCode": "44160"
          },
          {
            "name": "นาทอง",
            "postalCode": "44160"
          },
          {
            "name": "เสือเฒ่า",
            "postalCode": "44160"
          },
          {
            "name": "โพนทอง",
            "postalCode": "44160"
          },
          {
            "name": "เหล่าบัวบาน",
            "postalCode": "44160"
          }
        ]
      },
      {
        "name": "บรบือ",
        "subDistricts": [
          {
            "name": "บรบือ",
            "postalCode": "44130"
          },
          {
            "name": "บ่อใหญ่",
            "postalCode": "44130"
          },
          {
            "name": "วังไชย",
            "postalCode": "44130"
          },
          {
            "name": "หนองม่วง",
            "postalCode": "44130"
          },
          {
            "name": "กำพี้",
            "postalCode": "44130"
          },
          {
            "name": "โนนราษี",
            "postalCode": "44130"
          },
          {
            "name": "โนนแดง",
            "postalCode": "44130"
          },
          {
            "name": "หนองจิก",
            "postalCode": "44130"
          },
          {
            "name": "บัวมาศ",
            "postalCode": "44130"
          },
          {
            "name": "หนองคูขาด",
            "postalCode": "44130"
          },
          {
            "name": "วังใหม่",
            "postalCode": "44130"
          },
          {
            "name": "ยาง",
            "postalCode": "44130"
          },
          {
            "name": "หนองสิม",
            "postalCode": "44130"
          },
          {
            "name": "หนองโก",
            "postalCode": "44130"
          },
          {
            "name": "ดอนงัว",
            "postalCode": "44130"
          }
        ]
      },
      {
        "name": "นาเชือก",
        "subDistricts": [
          {
            "name": "นาเชือก",
            "postalCode": "44170"
          },
          {
            "name": "สำโรง",
            "postalCode": "44170"
          },
          {
            "name": "หนองแดง",
            "postalCode": "44170"
          },
          {
            "name": "เขวาไร่",
            "postalCode": "44170"
          },
          {
            "name": "หนองโพธิ์",
            "postalCode": "44170"
          },
          {
            "name": "ปอพาน",
            "postalCode": "44170"
          },
          {
            "name": "หนองเม็ก",
            "postalCode": "44170"
          },
          {
            "name": "หนองเรือ",
            "postalCode": "44170"
          },
          {
            "name": "หนองกุง",
            "postalCode": "44170"
          },
          {
            "name": "สันป่าตอง",
            "postalCode": "44170"
          }
        ]
      },
      {
        "name": "พยัคฆภูมิพิสัย",
        "subDistricts": [
          {
            "name": "ปะหลาน",
            "postalCode": "44110"
          },
          {
            "name": "ก้ามปู",
            "postalCode": "44110"
          },
          {
            "name": "เวียงสะอาด",
            "postalCode": "44110"
          },
          {
            "name": "เม็กดำ",
            "postalCode": "44110"
          },
          {
            "name": "นาสีนวล",
            "postalCode": "44110"
          },
          {
            "name": "ราษฎร์เจริญ",
            "postalCode": "44110"
          },
          {
            "name": "หนองบัวแก้ว",
            "postalCode": "44110"
          },
          {
            "name": "เมืองเตา",
            "postalCode": "44110"
          },
          {
            "name": "ลานสะแก",
            "postalCode": "44110"
          },
          {
            "name": "เวียงชัย",
            "postalCode": "44110"
          },
          {
            "name": "หนองบัว",
            "postalCode": "44110"
          },
          {
            "name": "ราษฎร์พัฒนา",
            "postalCode": "44110"
          },
          {
            "name": "เมืองเสือ",
            "postalCode": "44110"
          },
          {
            "name": "ภารแอ่น",
            "postalCode": "44110"
          }
        ]
      },
      {
        "name": "วาปีปทุม",
        "subDistricts": [
          {
            "name": "หนองแสง",
            "postalCode": "44120"
          },
          {
            "name": "ขามป้อม",
            "postalCode": "44120"
          },
          {
            "name": "เสือโก้ก",
            "postalCode": "44120"
          },
          {
            "name": "ดงใหญ่",
            "postalCode": "44120"
          },
          {
            "name": "โพธิ์ชัย",
            "postalCode": "44120"
          },
          {
            "name": "หัวเรือ",
            "postalCode": "44120"
          },
          {
            "name": "แคน",
            "postalCode": "44120"
          },
          {
            "name": "งัวบา",
            "postalCode": "44120"
          },
          {
            "name": "นาข่า",
            "postalCode": "44120"
          },
          {
            "name": "บ้านหวาย",
            "postalCode": "44120"
          },
          {
            "name": "หนองไฮ",
            "postalCode": "44120"
          },
          {
            "name": "ประชาพัฒนา",
            "postalCode": "44120"
          },
          {
            "name": "หนองทุ่ม",
            "postalCode": "44120"
          },
          {
            "name": "หนองแสน",
            "postalCode": "44120"
          },
          {
            "name": "โคกสีทองหลาง",
            "postalCode": "44120"
          }
        ]
      },
      {
        "name": "นาดูน",
        "subDistricts": [
          {
            "name": "นาดูน",
            "postalCode": "44180"
          },
          {
            "name": "หนองไผ่",
            "postalCode": "44180"
          },
          {
            "name": "หนองคู",
            "postalCode": "44180"
          },
          {
            "name": "ดงบัง",
            "postalCode": "44180"
          },
          {
            "name": "ดงดวน",
            "postalCode": "44180"
          },
          {
            "name": "หัวดง",
            "postalCode": "44180"
          },
          {
            "name": "ดงยาง",
            "postalCode": "44180"
          },
          {
            "name": "กู่สันตรัตน์",
            "postalCode": "44180"
          },
          {
            "name": "พระธาตุ",
            "postalCode": "44180"
          }
        ]
      },
      {
        "name": "ยางสีสุราช",
        "subDistricts": [
          {
            "name": "ยางสีสุราช",
            "postalCode": "44210"
          },
          {
            "name": "นาภู",
            "postalCode": "44210"
          },
          {
            "name": "แวงดง",
            "postalCode": "44210"
          },
          {
            "name": "บ้านกู่",
            "postalCode": "44210"
          },
          {
            "name": "ดงเมือง",
            "postalCode": "44210"
          },
          {
            "name": "ขามเรียน",
            "postalCode": "44210"
          },
          {
            "name": "หนองบัวสันตุ",
            "postalCode": "44210"
          }
        ]
      },
      {
        "name": "กุดรัง",
        "subDistricts": [
          {
            "name": "กุดรัง",
            "postalCode": "44130"
          },
          {
            "name": "นาโพธิ์",
            "postalCode": "44130"
          },
          {
            "name": "เลิงแฝก",
            "postalCode": "44130"
          },
          {
            "name": "หนองแวง",
            "postalCode": "44130"
          },
          {
            "name": "ห้วยเตย",
            "postalCode": "44130"
          }
        ]
      },
      {
        "name": "ชื่นชม",
        "subDistricts": [
          {
            "name": "ชื่นชม",
            "postalCode": "44160"
          },
          {
            "name": "กุดปลาดุก",
            "postalCode": "44160"
          },
          {
            "name": "เหล่าดอกไม้",
            "postalCode": "44160"
          },
          {
            "name": "หนองกุง",
            "postalCode": "44160"
          }
        ]
      }
    ]
  },
  {
    "name": "ร้อยเอ็ด",
    "districts": [
      {
        "name": "เมืองร้อยเอ็ด",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "45000"
          },
          {
            "name": "รอบเมือง",
            "postalCode": "45000"
          },
          {
            "name": "เหนือเมือง",
            "postalCode": "45000"
          },
          {
            "name": "ขอนแก่น",
            "postalCode": "45000"
          },
          {
            "name": "นาโพธิ์",
            "postalCode": "45000"
          },
          {
            "name": "สะอาดสมบูรณ์",
            "postalCode": "45000"
          },
          {
            "name": "สีแก้ว",
            "postalCode": "45000"
          },
          {
            "name": "ปอภาร  (ปอพาน)",
            "postalCode": "45000"
          },
          {
            "name": "โนนรัง",
            "postalCode": "45000"
          },
          {
            "name": "หนองแก้ว",
            "postalCode": "45000"
          },
          {
            "name": "หนองแวง",
            "postalCode": "45000"
          },
          {
            "name": "ดงลาน",
            "postalCode": "45000"
          },
          {
            "name": "แคนใหญ่",
            "postalCode": "45000"
          },
          {
            "name": "โนนตาล",
            "postalCode": "45000"
          },
          {
            "name": "เมืองทอง",
            "postalCode": "45000"
          }
        ]
      },
      {
        "name": "เกษตรวิสัย",
        "subDistricts": [
          {
            "name": "เกษตรวิสัย",
            "postalCode": "45150"
          },
          {
            "name": "เมืองบัว",
            "postalCode": "45150"
          },
          {
            "name": "เหล่าหลวง",
            "postalCode": "45150"
          },
          {
            "name": "สิงห์โคก",
            "postalCode": "45150"
          },
          {
            "name": "ดงครั่งใหญ่",
            "postalCode": "45150"
          },
          {
            "name": "บ้านฝาง",
            "postalCode": "45150"
          },
          {
            "name": "หนองแวง",
            "postalCode": "45150"
          },
          {
            "name": "กำแพง",
            "postalCode": "45150"
          },
          {
            "name": "กู่กาสิงห์",
            "postalCode": "45150"
          },
          {
            "name": "น้ำอ้อม",
            "postalCode": "45150"
          },
          {
            "name": "โนนสว่าง",
            "postalCode": "45150"
          },
          {
            "name": "ทุ่งทอง",
            "postalCode": "45150"
          },
          {
            "name": "ดงครั่งน้อย",
            "postalCode": "45150"
          }
        ]
      },
      {
        "name": "ปทุมรัตต์",
        "subDistricts": [
          {
            "name": "บัวแดง",
            "postalCode": "45190"
          },
          {
            "name": "ดอกล้ำ",
            "postalCode": "45190"
          },
          {
            "name": "หนองแคน",
            "postalCode": "45190"
          },
          {
            "name": "โพนสูง",
            "postalCode": "45190"
          },
          {
            "name": "โนนสวรรค์",
            "postalCode": "45190"
          },
          {
            "name": "สระบัว",
            "postalCode": "45190"
          },
          {
            "name": "โนนสง่า",
            "postalCode": "45190"
          },
          {
            "name": "ขี้เหล็ก",
            "postalCode": "45190"
          }
        ]
      },
      {
        "name": "จตุรพักตรพิมาน",
        "subDistricts": [
          {
            "name": "หัวช้าง",
            "postalCode": "45180"
          },
          {
            "name": "หนองผือ",
            "postalCode": "45180"
          },
          {
            "name": "เมืองหงส์",
            "postalCode": "45180"
          },
          {
            "name": "โคกล่าม",
            "postalCode": "45180"
          },
          {
            "name": "น้ำใส",
            "postalCode": "45180"
          },
          {
            "name": "ดงแดง",
            "postalCode": "45180"
          },
          {
            "name": "ดงกลาง",
            "postalCode": "45180"
          },
          {
            "name": "ป่าสังข์",
            "postalCode": "45180"
          },
          {
            "name": "อีง่อง",
            "postalCode": "45180"
          },
          {
            "name": "ลิ้นฟ้า",
            "postalCode": "45180"
          },
          {
            "name": "ดู่น้อย",
            "postalCode": "45180"
          },
          {
            "name": "ศรีโคตร",
            "postalCode": "45180"
          }
        ]
      },
      {
        "name": "ธวัชบุรี",
        "subDistricts": [
          {
            "name": "นิเวศน์",
            "postalCode": "45170"
          },
          {
            "name": "ธงธานี",
            "postalCode": "45170"
          },
          {
            "name": "หนองไผ่",
            "postalCode": "45170"
          },
          {
            "name": "ธวัชบุรี",
            "postalCode": "45170"
          },
          {
            "name": "อุ่มเม้า",
            "postalCode": "45170"
          },
          {
            "name": "มะอึ",
            "postalCode": "45170"
          },
          {
            "name": "เขวาทุ่ง",
            "postalCode": "45170"
          },
          {
            "name": "ไพศาล",
            "postalCode": "45170"
          },
          {
            "name": "เมืองน้อย",
            "postalCode": "45170"
          },
          {
            "name": "บึงนคร",
            "postalCode": "45170"
          },
          {
            "name": "ราชธานี",
            "postalCode": "45170"
          },
          {
            "name": "หนองพอก",
            "postalCode": "45170"
          }
        ]
      },
      {
        "name": "พนมไพร",
        "subDistricts": [
          {
            "name": "พนมไพร",
            "postalCode": "45140"
          },
          {
            "name": "แสนสุข",
            "postalCode": "45140"
          },
          {
            "name": "กุดน้ำใส",
            "postalCode": "45140"
          },
          {
            "name": "หนองทัพไทย",
            "postalCode": "45140"
          },
          {
            "name": "โพธิ์ใหญ่",
            "postalCode": "45140"
          },
          {
            "name": "วารีสวัสดิ์",
            "postalCode": "45140"
          },
          {
            "name": "โคกสว่าง",
            "postalCode": "45140"
          },
          {
            "name": "โพธิ์ชัย",
            "postalCode": "45140"
          },
          {
            "name": "นานวล",
            "postalCode": "45140"
          },
          {
            "name": "คำไฮ",
            "postalCode": "45140"
          },
          {
            "name": "สระแก้ว",
            "postalCode": "45140"
          },
          {
            "name": "ค้อใหญ่",
            "postalCode": "45140"
          },
          {
            "name": "ชานุวรรณ",
            "postalCode": "45140"
          }
        ]
      },
      {
        "name": "โพนทอง",
        "subDistricts": [
          {
            "name": "แวง",
            "postalCode": "45110"
          },
          {
            "name": "โคกกกม่วง",
            "postalCode": "45110"
          },
          {
            "name": "นาอุดม",
            "postalCode": "45110"
          },
          {
            "name": "สว่าง",
            "postalCode": "45110"
          },
          {
            "name": "หนองใหญ่",
            "postalCode": "45110"
          },
          {
            "name": "โพธิ์ทอง",
            "postalCode": "45110"
          },
          {
            "name": "โนนชัยศรี",
            "postalCode": "45110"
          },
          {
            "name": "โพธิ์ศรีสว่าง",
            "postalCode": "45110"
          },
          {
            "name": "อุ่มเม่า",
            "postalCode": "45110"
          },
          {
            "name": "คำนาดี",
            "postalCode": "45110"
          },
          {
            "name": "พรมสวรรค์",
            "postalCode": "45110"
          },
          {
            "name": "สระนกแก้ว",
            "postalCode": "45110"
          },
          {
            "name": "วังสามัคคี",
            "postalCode": "45110"
          },
          {
            "name": "โคกสูง",
            "postalCode": "45110"
          }
        ]
      },
      {
        "name": "โพธิ์ชัย",
        "subDistricts": [
          {
            "name": "ขามเปี้ย",
            "postalCode": "45230"
          },
          {
            "name": "เชียงใหม่",
            "postalCode": "45230"
          },
          {
            "name": "บัวคำ",
            "postalCode": "45230"
          },
          {
            "name": "อัคคะคำ",
            "postalCode": "45230"
          },
          {
            "name": "สะอาด",
            "postalCode": "45230"
          },
          {
            "name": "คำพอุง",
            "postalCode": "45230"
          },
          {
            "name": "หนองตาไก้",
            "postalCode": "45230"
          },
          {
            "name": "ดอนโอง",
            "postalCode": "45230"
          },
          {
            "name": "โพธิ์ศรี",
            "postalCode": "45230"
          }
        ]
      },
      {
        "name": "หนองพอก",
        "subDistricts": [
          {
            "name": "หนองพอก",
            "postalCode": "45210"
          },
          {
            "name": "บึงงาม",
            "postalCode": "45210"
          },
          {
            "name": "ภูเขาทอง",
            "postalCode": "45210"
          },
          {
            "name": "กกโพธิ์",
            "postalCode": "45210"
          },
          {
            "name": "โคกสว่าง",
            "postalCode": "45210"
          },
          {
            "name": "หนองขุ่นใหญ่",
            "postalCode": "45210"
          },
          {
            "name": "รอบเมือง",
            "postalCode": "45210"
          },
          {
            "name": "ผาน้ำย้อย",
            "postalCode": "45210"
          },
          {
            "name": "ท่าสีดา",
            "postalCode": "45210"
          }
        ]
      },
      {
        "name": "เสลภูมิ",
        "subDistricts": [
          {
            "name": "กลาง",
            "postalCode": "45120"
          },
          {
            "name": "นางาม",
            "postalCode": "45120"
          },
          {
            "name": "เมืองไพร",
            "postalCode": "45120"
          },
          {
            "name": "นาแซง",
            "postalCode": "45120"
          },
          {
            "name": "นาเมือง",
            "postalCode": "45120"
          },
          {
            "name": "วังหลวง",
            "postalCode": "45120"
          },
          {
            "name": "ท่าม่วง",
            "postalCode": "45120"
          },
          {
            "name": "ขวาว",
            "postalCode": "45120"
          },
          {
            "name": "โพธิ์ทอง",
            "postalCode": "45120"
          },
          {
            "name": "ภูเงิน",
            "postalCode": "45120"
          },
          {
            "name": "เกาะแก้ว",
            "postalCode": "45120"
          },
          {
            "name": "นาเลิง",
            "postalCode": "45120"
          },
          {
            "name": "เหล่าน้อย",
            "postalCode": "45120"
          },
          {
            "name": "ศรีวิลัย",
            "postalCode": "45120"
          },
          {
            "name": "หนองหลวง",
            "postalCode": "45120"
          },
          {
            "name": "พรสวรรค์",
            "postalCode": "45120"
          },
          {
            "name": "ขวัญเมือง",
            "postalCode": "45120"
          },
          {
            "name": "บึงเกลือ",
            "postalCode": "45120"
          }
        ]
      },
      {
        "name": "สุวรรณภูมิ",
        "subDistricts": [
          {
            "name": "สระคู",
            "postalCode": "45130"
          },
          {
            "name": "ดอกไม้",
            "postalCode": "45130"
          },
          {
            "name": "นาใหญ่",
            "postalCode": "45130"
          },
          {
            "name": "หินกอง",
            "postalCode": "45130"
          },
          {
            "name": "เมืองทุ่ง",
            "postalCode": "45130"
          },
          {
            "name": "หัวโทน",
            "postalCode": "45130"
          },
          {
            "name": "บ่อพันขัน",
            "postalCode": "45130"
          },
          {
            "name": "ทุ่งหลวง",
            "postalCode": "45130"
          },
          {
            "name": "หัวช้าง",
            "postalCode": "45130"
          },
          {
            "name": "น้ำคำ",
            "postalCode": "45130"
          },
          {
            "name": "ห้วยหินลาด",
            "postalCode": "45130"
          },
          {
            "name": "ช้างเผือก",
            "postalCode": "45130"
          },
          {
            "name": "ทุ่งกุลา",
            "postalCode": "45130"
          },
          {
            "name": "ทุ่งศรีเมือง",
            "postalCode": "45130"
          },
          {
            "name": "จำปาขัน",
            "postalCode": "45130"
          }
        ]
      },
      {
        "name": "เมืองสรวง",
        "subDistricts": [
          {
            "name": "หนองผือ",
            "postalCode": "45220"
          },
          {
            "name": "หนองหิน",
            "postalCode": "45220"
          },
          {
            "name": "คูเมือง",
            "postalCode": "45220"
          },
          {
            "name": "กกกุง",
            "postalCode": "45220"
          },
          {
            "name": "เมืองสรวง",
            "postalCode": "45220"
          }
        ]
      },
      {
        "name": "โพนทราย",
        "subDistricts": [
          {
            "name": "โพนทราย",
            "postalCode": "45240"
          },
          {
            "name": "สามขา",
            "postalCode": "45240"
          },
          {
            "name": "ศรีสว่าง",
            "postalCode": "45240"
          },
          {
            "name": "ยางคำ",
            "postalCode": "45240"
          },
          {
            "name": "ท่าหาดยาว",
            "postalCode": "45240"
          }
        ]
      },
      {
        "name": "อาจสามารถ",
        "subDistricts": [
          {
            "name": "อาจสามารถ",
            "postalCode": "45160"
          },
          {
            "name": "โพนเมือง",
            "postalCode": "45160"
          },
          {
            "name": "บ้านแจ้ง",
            "postalCode": "45160"
          },
          {
            "name": "หน่อม",
            "postalCode": "45160"
          },
          {
            "name": "หนองหมื่นถ่าน",
            "postalCode": "45160"
          },
          {
            "name": "หนองขาม",
            "postalCode": "45160"
          },
          {
            "name": "โหรา",
            "postalCode": "45160"
          },
          {
            "name": "หนองบัว",
            "postalCode": "45160"
          },
          {
            "name": "ขี้เหล็ก",
            "postalCode": "45160"
          },
          {
            "name": "บ้านดู่",
            "postalCode": "45160"
          }
        ]
      },
      {
        "name": "เมยวดี",
        "subDistricts": [
          {
            "name": "เมยวดี",
            "postalCode": "45250"
          },
          {
            "name": "ชุมพร",
            "postalCode": "45250"
          },
          {
            "name": "บุ่งเลิศ",
            "postalCode": "45250"
          },
          {
            "name": "ชมสะอาด",
            "postalCode": "45250"
          }
        ]
      },
      {
        "name": "ศรีสมเด็จ",
        "subDistricts": [
          {
            "name": "โพธิ์ทอง",
            "postalCode": "45000"
          },
          {
            "name": "ศรีสมเด็จ",
            "postalCode": "45000"
          },
          {
            "name": "เมืองเปลือย",
            "postalCode": "45000"
          },
          {
            "name": "หนองใหญ่",
            "postalCode": "45000"
          },
          {
            "name": "สวนจิก",
            "postalCode": "45280"
          },
          {
            "name": "โพธิ์สัย",
            "postalCode": "45280"
          },
          {
            "name": "หนองแวงควง",
            "postalCode": "45000"
          },
          {
            "name": "บ้านบาก",
            "postalCode": "45000"
          }
        ]
      },
      {
        "name": "จังหาร",
        "subDistricts": [
          {
            "name": "ดินดำ",
            "postalCode": "45000"
          },
          {
            "name": "ปาฝา",
            "postalCode": "45000"
          },
          {
            "name": "ม่วงลาด",
            "postalCode": "45000"
          },
          {
            "name": "จังหาร",
            "postalCode": "45000"
          },
          {
            "name": "ดงสิงห์",
            "postalCode": "45000"
          },
          {
            "name": "ยางใหญ่",
            "postalCode": "45000"
          },
          {
            "name": "ผักแว่น",
            "postalCode": "45000"
          },
          {
            "name": "แสนชาติ",
            "postalCode": "45000"
          }
        ]
      },
      {
        "name": "เชียงขวัญ",
        "subDistricts": [
          {
            "name": "เชียงขวัญ",
            "postalCode": "45000"
          },
          {
            "name": "พลับพลา",
            "postalCode": "45170"
          },
          {
            "name": "พระธาตุ",
            "postalCode": "45000"
          },
          {
            "name": "พระเจ้า",
            "postalCode": "45000"
          },
          {
            "name": "หมูม้น",
            "postalCode": "45170"
          },
          {
            "name": "บ้านเขือง",
            "postalCode": "45000"
          }
        ]
      },
      {
        "name": "หนองฮี",
        "subDistricts": [
          {
            "name": "หนองฮี",
            "postalCode": "45140"
          },
          {
            "name": "สาวแห",
            "postalCode": "45140"
          },
          {
            "name": "ดูกอึ่ง",
            "postalCode": "45140"
          },
          {
            "name": "เด่นราษฎร์",
            "postalCode": "45140"
          }
        ]
      },
      {
        "name": "ทุ่งเขาหลวง",
        "subDistricts": [
          {
            "name": "ทุ่งเขาหลวง",
            "postalCode": "45170"
          },
          {
            "name": "เทอดไทย",
            "postalCode": "45170"
          },
          {
            "name": "บึงงาม",
            "postalCode": "45170"
          },
          {
            "name": "มะบ้า",
            "postalCode": "45170"
          },
          {
            "name": "เหล่า",
            "postalCode": "45170"
          }
        ]
      }
    ]
  },
  {
    "name": "กาฬสินธุ์",
    "districts": [
      {
        "name": "เมืองกาฬสินธุ์",
        "subDistricts": [
          {
            "name": "กาฬสินธุ์",
            "postalCode": "46000"
          },
          {
            "name": "เหนือ",
            "postalCode": "46000"
          },
          {
            "name": "หลุบ",
            "postalCode": "46000"
          },
          {
            "name": "ไผ่",
            "postalCode": "46000"
          },
          {
            "name": "ลำปาว",
            "postalCode": "46000"
          },
          {
            "name": "ลำพาน",
            "postalCode": "46000"
          },
          {
            "name": "เชียงเครือ",
            "postalCode": "46000"
          },
          {
            "name": "บึงวิชัย",
            "postalCode": "46000"
          },
          {
            "name": "ห้วยโพธิ์",
            "postalCode": "46000"
          },
          {
            "name": "ภูปอ",
            "postalCode": "46000"
          },
          {
            "name": "ภูดิน",
            "postalCode": "46000"
          },
          {
            "name": "หนองกุง",
            "postalCode": "46000"
          },
          {
            "name": "กลางหมื่น",
            "postalCode": "46000"
          },
          {
            "name": "ขมิ้น",
            "postalCode": "46000"
          },
          {
            "name": "โพนทอง",
            "postalCode": "46000"
          },
          {
            "name": "นาจารย์",
            "postalCode": "46000"
          },
          {
            "name": "ลำคลอง",
            "postalCode": "46000"
          }
        ]
      },
      {
        "name": "นามน",
        "subDistricts": [
          {
            "name": "นามน",
            "postalCode": "46230"
          },
          {
            "name": "ยอดแกง",
            "postalCode": "46230"
          },
          {
            "name": "สงเปลือย",
            "postalCode": "46230"
          },
          {
            "name": "หลักเหลี่ยม",
            "postalCode": "46230"
          },
          {
            "name": "หนองบัว",
            "postalCode": "46230"
          }
        ]
      },
      {
        "name": "กมลาไสย",
        "subDistricts": [
          {
            "name": "กมลาไสย",
            "postalCode": "46130"
          },
          {
            "name": "หลักเมือง",
            "postalCode": "46130"
          },
          {
            "name": "โพนงาม",
            "postalCode": "46130"
          },
          {
            "name": "ดงลิง",
            "postalCode": "46130"
          },
          {
            "name": "ธัญญา",
            "postalCode": "46130"
          },
          {
            "name": "หนองแปน",
            "postalCode": "46130"
          },
          {
            "name": "เจ้าท่า",
            "postalCode": "46130"
          },
          {
            "name": "โคกสมบูรณ์",
            "postalCode": "46130"
          }
        ]
      },
      {
        "name": "ร่องคำ",
        "subDistricts": [
          {
            "name": "ร่องคำ",
            "postalCode": "46210"
          },
          {
            "name": "สามัคคี",
            "postalCode": "46210"
          },
          {
            "name": "เหล่าอ้อย",
            "postalCode": "46210"
          }
        ]
      },
      {
        "name": "กุฉินารายณ์",
        "subDistricts": [
          {
            "name": "บัวขาว",
            "postalCode": "46110"
          },
          {
            "name": "แจนแลน",
            "postalCode": "46110"
          },
          {
            "name": "เหล่าใหญ่",
            "postalCode": "46110"
          },
          {
            "name": "จุมจัง",
            "postalCode": "46110"
          },
          {
            "name": "เหล่าไฮงาม",
            "postalCode": "46110"
          },
          {
            "name": "กุดหว้า",
            "postalCode": "46110"
          },
          {
            "name": "สามขา",
            "postalCode": "46110"
          },
          {
            "name": "นาขาม",
            "postalCode": "46110"
          },
          {
            "name": "หนองห้าง",
            "postalCode": "46110"
          },
          {
            "name": "นาโก",
            "postalCode": "46110"
          },
          {
            "name": "สมสะอาด",
            "postalCode": "46110"
          },
          {
            "name": "กุดค้าว",
            "postalCode": "46110"
          }
        ]
      },
      {
        "name": "เขาวง",
        "subDistricts": [
          {
            "name": "คุ้มเก่า",
            "postalCode": "46160"
          },
          {
            "name": "สงเปลือย",
            "postalCode": "46160"
          },
          {
            "name": "หนองผือ",
            "postalCode": "46160"
          },
          {
            "name": "กุดสิมคุ้มใหม่",
            "postalCode": "46160"
          },
          {
            "name": "สระพังทอง",
            "postalCode": "46160"
          },
          {
            "name": "กุดปลาค้าว",
            "postalCode": "46160"
          }
        ]
      },
      {
        "name": "ยางตลาด",
        "subDistricts": [
          {
            "name": "ยางตลาด",
            "postalCode": "46120"
          },
          {
            "name": "หัวงัว",
            "postalCode": "46120"
          },
          {
            "name": "อุ่มเม่า",
            "postalCode": "46120"
          },
          {
            "name": "บัวบาน",
            "postalCode": "46120"
          },
          {
            "name": "เว่อ",
            "postalCode": "46120"
          },
          {
            "name": "อิตื้อ",
            "postalCode": "46120"
          },
          {
            "name": "หัวนาคำ",
            "postalCode": "46120"
          },
          {
            "name": "หนองอิเฒ่า",
            "postalCode": "46120"
          },
          {
            "name": "ดอนสมบูรณ์",
            "postalCode": "46120"
          },
          {
            "name": "นาเชือก",
            "postalCode": "46120"
          },
          {
            "name": "คลองขาม",
            "postalCode": "46120"
          },
          {
            "name": "เขาพระนอน",
            "postalCode": "46120"
          },
          {
            "name": "นาดี",
            "postalCode": "46120"
          },
          {
            "name": "โนนสูง",
            "postalCode": "46120"
          },
          {
            "name": "หนองตอกแป้น",
            "postalCode": "46120"
          }
        ]
      },
      {
        "name": "ห้วยเม็ก",
        "subDistricts": [
          {
            "name": "ห้วยเม็ก",
            "postalCode": "46170"
          },
          {
            "name": "คำใหญ่",
            "postalCode": "46170"
          },
          {
            "name": "กุดโดน",
            "postalCode": "46170"
          },
          {
            "name": "บึงนาเรียง",
            "postalCode": "46170"
          },
          {
            "name": "หัวหิน",
            "postalCode": "46170"
          },
          {
            "name": "พิมูล",
            "postalCode": "46170"
          },
          {
            "name": "คำเหมือดแก้ว",
            "postalCode": "46170"
          },
          {
            "name": "โนนสะอาด",
            "postalCode": "46170"
          },
          {
            "name": "ทรายทอง",
            "postalCode": "46170"
          }
        ]
      },
      {
        "name": "สหัสขันธ์",
        "subDistricts": [
          {
            "name": "ภูสิงห์",
            "postalCode": "46140"
          },
          {
            "name": "สหัสขันธ์",
            "postalCode": "46140"
          },
          {
            "name": "นามะเขือ",
            "postalCode": "46140"
          },
          {
            "name": "โนนศิลา",
            "postalCode": "46140"
          },
          {
            "name": "นิคม",
            "postalCode": "46140"
          },
          {
            "name": "โนนแหลมทอง",
            "postalCode": "46140"
          },
          {
            "name": "โนนบุรี",
            "postalCode": "46140"
          },
          {
            "name": "โนนน้ำเกลี้ยง",
            "postalCode": "46140"
          }
        ]
      },
      {
        "name": "คำม่วง",
        "subDistricts": [
          {
            "name": "ทุ่งคลอง",
            "postalCode": "46180"
          },
          {
            "name": "โพน",
            "postalCode": "46180"
          },
          {
            "name": "ดินจี่",
            "postalCode": "46180"
          },
          {
            "name": "นาบอน",
            "postalCode": "46180"
          },
          {
            "name": "นาทัน",
            "postalCode": "46180"
          },
          {
            "name": "เนินยาง",
            "postalCode": "46180"
          }
        ]
      },
      {
        "name": "ท่าคันโท",
        "subDistricts": [
          {
            "name": "ท่าคันโท",
            "postalCode": "46190"
          },
          {
            "name": "กุงเก่า",
            "postalCode": "46190"
          },
          {
            "name": "ยางอู้ม",
            "postalCode": "46190"
          },
          {
            "name": "กุดจิก",
            "postalCode": "46190"
          },
          {
            "name": "นาตาล",
            "postalCode": "46190"
          },
          {
            "name": "ดงสมบูรณ์",
            "postalCode": "46190"
          }
        ]
      },
      {
        "name": "หนองกุงศรี",
        "subDistricts": [
          {
            "name": "หนองกุงศรี",
            "postalCode": "46220"
          },
          {
            "name": "หนองบัว",
            "postalCode": "46220"
          },
          {
            "name": "โคกเครือ",
            "postalCode": "46220"
          },
          {
            "name": "หนองสรวง",
            "postalCode": "46220"
          },
          {
            "name": "เสาเล้า",
            "postalCode": "46220"
          },
          {
            "name": "หนองใหญ่",
            "postalCode": "46220"
          },
          {
            "name": "ดงมูล",
            "postalCode": "46220"
          },
          {
            "name": "ลำหนองแสน",
            "postalCode": "46220"
          },
          {
            "name": "หนองหิน",
            "postalCode": "46220"
          }
        ]
      },
      {
        "name": "สมเด็จ",
        "subDistricts": [
          {
            "name": "สมเด็จ",
            "postalCode": "46150"
          },
          {
            "name": "หนองแวง",
            "postalCode": "46150"
          },
          {
            "name": "แซงบาดาล",
            "postalCode": "46150"
          },
          {
            "name": "มหาไชย",
            "postalCode": "46150"
          },
          {
            "name": "หมูม่น",
            "postalCode": "46150"
          },
          {
            "name": "ผาเสวย",
            "postalCode": "46150"
          },
          {
            "name": "ศรีสมเด็จ",
            "postalCode": "46150"
          },
          {
            "name": "ลำห้วยหลัว",
            "postalCode": "46150"
          }
        ]
      },
      {
        "name": "ห้วยผึ้ง",
        "subDistricts": [
          {
            "name": "คำบง",
            "postalCode": "46240"
          },
          {
            "name": "ไค้นุ่น",
            "postalCode": "46240"
          },
          {
            "name": "นิคมห้วยผึ้ง",
            "postalCode": "46240"
          },
          {
            "name": "หนองอีบุตร",
            "postalCode": "46240"
          }
        ]
      },
      {
        "name": "สามชัย",
        "subDistricts": [
          {
            "name": "สำราญ",
            "postalCode": "46180"
          },
          {
            "name": "สำราญใต้",
            "postalCode": "46180"
          },
          {
            "name": "คำสร้างเที่ยง",
            "postalCode": "46180"
          },
          {
            "name": "หนองช้าง",
            "postalCode": "46180"
          }
        ]
      },
      {
        "name": "นาคู",
        "subDistricts": [
          {
            "name": "นาคู",
            "postalCode": "46160"
          },
          {
            "name": "สายนาวัง",
            "postalCode": "46160"
          },
          {
            "name": "โนนนาจาน",
            "postalCode": "46160"
          },
          {
            "name": "บ่อแก้ว",
            "postalCode": "46160"
          },
          {
            "name": "ภูแล่นช้าง",
            "postalCode": "46160"
          }
        ]
      },
      {
        "name": "ดอนจาน",
        "subDistricts": [
          {
            "name": "ดอนจาน",
            "postalCode": "46000"
          },
          {
            "name": "สะอาดไชยศรี",
            "postalCode": "46000"
          },
          {
            "name": "ดงพยุง",
            "postalCode": "46000"
          },
          {
            "name": "ม่วงนา",
            "postalCode": "46000"
          },
          {
            "name": "นาจำปา",
            "postalCode": "46000"
          }
        ]
      },
      {
        "name": "ฆ้องชัย",
        "subDistricts": [
          {
            "name": "ฆ้องชัยพัฒนา",
            "postalCode": "46130"
          },
          {
            "name": "เหล่ากลาง",
            "postalCode": "46130"
          },
          {
            "name": "โคกสะอาด",
            "postalCode": "46130"
          },
          {
            "name": "โนนศิลาเลิง",
            "postalCode": "46130"
          },
          {
            "name": "ลำชี",
            "postalCode": "46130"
          }
        ]
      }
    ]
  },
  {
    "name": "สกลนคร",
    "districts": [
      {
        "name": "เมืองสกลนคร",
        "subDistricts": [
          {
            "name": "ธาตุเชิงชุม",
            "postalCode": "47000"
          },
          {
            "name": "ขมิ้น",
            "postalCode": "47220"
          },
          {
            "name": "งิ้วด่อน",
            "postalCode": "47000"
          },
          {
            "name": "โนนหอม",
            "postalCode": "47000"
          },
          {
            "name": "เชียงเครือ",
            "postalCode": "47000"
          },
          {
            "name": "ท่าแร่",
            "postalCode": "47000"
          },
          {
            "name": "ม่วงลาย",
            "postalCode": "47000"
          },
          {
            "name": "ดงชน",
            "postalCode": "47000"
          },
          {
            "name": "ห้วยยาง",
            "postalCode": "47000"
          },
          {
            "name": "พังขว้าง",
            "postalCode": "47000"
          },
          {
            "name": "ดงมะไฟ",
            "postalCode": "47000"
          },
          {
            "name": "ธาตุนาเวง",
            "postalCode": "47000"
          },
          {
            "name": "เหล่าปอแดง",
            "postalCode": "47000"
          },
          {
            "name": "หนองลาด",
            "postalCode": "47220"
          },
          {
            "name": "ฮางโฮง",
            "postalCode": "47000"
          },
          {
            "name": "โคกก่อง",
            "postalCode": "47000"
          }
        ]
      },
      {
        "name": "กุสุมาลย์",
        "subDistricts": [
          {
            "name": "กุสุมาลย์",
            "postalCode": "47210"
          },
          {
            "name": "นาโพธิ์",
            "postalCode": "47210"
          },
          {
            "name": "นาเพียง",
            "postalCode": "47230"
          },
          {
            "name": "โพธิไพศาล",
            "postalCode": "47210"
          },
          {
            "name": "อุ่มจาน",
            "postalCode": "47230"
          }
        ]
      },
      {
        "name": "กุดบาก",
        "subDistricts": [
          {
            "name": "กุดบาก",
            "postalCode": "47180"
          },
          {
            "name": "นาม่อง",
            "postalCode": "47180"
          },
          {
            "name": "กุดไห",
            "postalCode": "47180"
          }
        ]
      },
      {
        "name": "พรรณานิคม",
        "subDistricts": [
          {
            "name": "พรรณา",
            "postalCode": "47130"
          },
          {
            "name": "วังยาง",
            "postalCode": "47130"
          },
          {
            "name": "พอกน้อย",
            "postalCode": "47220"
          },
          {
            "name": "นาหัวบ่อ",
            "postalCode": "47220"
          },
          {
            "name": "ไร่",
            "postalCode": "47130"
          },
          {
            "name": "ช้างมิ่ง",
            "postalCode": "47130"
          },
          {
            "name": "นาใน",
            "postalCode": "47130"
          },
          {
            "name": "สว่าง",
            "postalCode": "47130"
          },
          {
            "name": "บะฮี",
            "postalCode": "47130"
          },
          {
            "name": "เชิงชุม",
            "postalCode": "47130"
          }
        ]
      },
      {
        "name": "พังโคน",
        "subDistricts": [
          {
            "name": "พังโคน",
            "postalCode": "47160"
          },
          {
            "name": "ม่วงไข่",
            "postalCode": "47160"
          },
          {
            "name": "แร่",
            "postalCode": "47160"
          },
          {
            "name": "ไฮหย่อง",
            "postalCode": "47160"
          },
          {
            "name": "ต้นผึ้ง",
            "postalCode": "47160"
          }
        ]
      },
      {
        "name": "วาริชภูมิ",
        "subDistricts": [
          {
            "name": "วาริชภูมิ",
            "postalCode": "47150"
          },
          {
            "name": "ปลาโหล",
            "postalCode": "47150"
          },
          {
            "name": "หนองลาด",
            "postalCode": "47150"
          },
          {
            "name": "คำบ่อ",
            "postalCode": "47150"
          },
          {
            "name": "ค้อเขียว",
            "postalCode": "47150"
          }
        ]
      },
      {
        "name": "นิคมน้ำอูน",
        "subDistricts": [
          {
            "name": "นิคมน้ำอูน",
            "postalCode": "47270"
          },
          {
            "name": "หนองปลิง",
            "postalCode": "47270"
          },
          {
            "name": "หนองบัว",
            "postalCode": "47270"
          },
          {
            "name": "สุวรรณคาม",
            "postalCode": "47270"
          }
        ]
      },
      {
        "name": "วานรนิวาส",
        "subDistricts": [
          {
            "name": "วานรนิวาส",
            "postalCode": "47120"
          },
          {
            "name": "เดื่อศรีคันไชย",
            "postalCode": "47120"
          },
          {
            "name": "ขัวก่าย",
            "postalCode": "47120"
          },
          {
            "name": "หนองสนม",
            "postalCode": "47120"
          },
          {
            "name": "คูสะคาม",
            "postalCode": "47120"
          },
          {
            "name": "ธาตุ",
            "postalCode": "47120"
          },
          {
            "name": "หนองแวง",
            "postalCode": "47120"
          },
          {
            "name": "ศรีวิชัย",
            "postalCode": "47120"
          },
          {
            "name": "นาซอ",
            "postalCode": "47120"
          },
          {
            "name": "อินทร์แปลง",
            "postalCode": "47120"
          },
          {
            "name": "นาคำ",
            "postalCode": "47120"
          },
          {
            "name": "คอนสวรรค์",
            "postalCode": "47120"
          },
          {
            "name": "กุดเรือคำ",
            "postalCode": "47120"
          },
          {
            "name": "หนองแวงใต้",
            "postalCode": "47120"
          }
        ]
      },
      {
        "name": "คำตากล้า",
        "subDistricts": [
          {
            "name": "คำตากล้า",
            "postalCode": "47250"
          },
          {
            "name": "หนองบัวสิม",
            "postalCode": "47250"
          },
          {
            "name": "นาแต้",
            "postalCode": "47250"
          },
          {
            "name": "แพด",
            "postalCode": "47250"
          }
        ]
      },
      {
        "name": "บ้านม่วง",
        "subDistricts": [
          {
            "name": "ม่วง",
            "postalCode": "47140"
          },
          {
            "name": "มาย",
            "postalCode": "47140"
          },
          {
            "name": "ดงหม้อทอง",
            "postalCode": "47140"
          },
          {
            "name": "ดงเหนือ",
            "postalCode": "47140"
          },
          {
            "name": "ดงหม้อทองใต้",
            "postalCode": "47140"
          },
          {
            "name": "ห้วยหลัว",
            "postalCode": "47140"
          },
          {
            "name": "โนนสะอาด",
            "postalCode": "47140"
          },
          {
            "name": "หนองกวั่ง",
            "postalCode": "47140"
          },
          {
            "name": "บ่อแก้ว",
            "postalCode": "47140"
          }
        ]
      },
      {
        "name": "อากาศอำนวย",
        "subDistricts": [
          {
            "name": "อากาศ",
            "postalCode": "47170"
          },
          {
            "name": "โพนแพง",
            "postalCode": "47170"
          },
          {
            "name": "วาใหญ่",
            "postalCode": "47170"
          },
          {
            "name": "โพนงาม",
            "postalCode": "47170"
          },
          {
            "name": "ท่าก้อน",
            "postalCode": "47170"
          },
          {
            "name": "นาฮี",
            "postalCode": "47170"
          },
          {
            "name": "บะหว้า",
            "postalCode": "47170"
          },
          {
            "name": "สามัคคีพัฒนา",
            "postalCode": "47170"
          }
        ]
      },
      {
        "name": "สว่างแดนดิน",
        "subDistricts": [
          {
            "name": "สว่างแดนดิน",
            "postalCode": "47110"
          },
          {
            "name": "คำสะอาด",
            "postalCode": "47110"
          },
          {
            "name": "บ้านต้าย",
            "postalCode": "47110"
          },
          {
            "name": "บงเหนือ",
            "postalCode": "47110"
          },
          {
            "name": "โพนสูง",
            "postalCode": "47110"
          },
          {
            "name": "โคกสี",
            "postalCode": "47110"
          },
          {
            "name": "หนองหลวง",
            "postalCode": "47110"
          },
          {
            "name": "บงใต้",
            "postalCode": "47110"
          },
          {
            "name": "ค้อใต้",
            "postalCode": "47110"
          },
          {
            "name": "พันนา",
            "postalCode": "47240"
          },
          {
            "name": "แวง",
            "postalCode": "47240"
          },
          {
            "name": "ทรายมูล",
            "postalCode": "47110"
          },
          {
            "name": "ตาลโกน",
            "postalCode": "47240"
          },
          {
            "name": "ตาลเนิ้ง",
            "postalCode": "47240"
          },
          {
            "name": "ธาตุทอง",
            "postalCode": "47240"
          },
          {
            "name": "บ้านถ่อน",
            "postalCode": "47110"
          }
        ]
      },
      {
        "name": "ส่องดาว",
        "subDistricts": [
          {
            "name": "ส่องดาว",
            "postalCode": "47190"
          },
          {
            "name": "ท่าศิลา",
            "postalCode": "47190"
          },
          {
            "name": "วัฒนา",
            "postalCode": "47190"
          },
          {
            "name": "ปทุมวาปี",
            "postalCode": "47190"
          }
        ]
      },
      {
        "name": "เต่างอย",
        "subDistricts": [
          {
            "name": "เต่างอย",
            "postalCode": "47260"
          },
          {
            "name": "บึงทวาย",
            "postalCode": "47260"
          },
          {
            "name": "นาตาล",
            "postalCode": "47260"
          },
          {
            "name": "จันทร์เพ็ญ",
            "postalCode": "47260"
          }
        ]
      },
      {
        "name": "โคกศรีสุพรรณ",
        "subDistricts": [
          {
            "name": "ตองโขบ",
            "postalCode": "47280"
          },
          {
            "name": "เหล่าโพนค้อ",
            "postalCode": "47280"
          },
          {
            "name": "ด่านม่วงคำ",
            "postalCode": "47280"
          },
          {
            "name": "แมดนาท่ม",
            "postalCode": "47280"
          }
        ]
      },
      {
        "name": "เจริญศิลป์",
        "subDistricts": [
          {
            "name": "บ้านเหล่า",
            "postalCode": "47290"
          },
          {
            "name": "เจริญศิลป์",
            "postalCode": "47290"
          },
          {
            "name": "ทุ่งแก",
            "postalCode": "47290"
          },
          {
            "name": "โคกศิลา",
            "postalCode": "47290"
          },
          {
            "name": "หนองแปน",
            "postalCode": "47290"
          }
        ]
      },
      {
        "name": "โพนนาแก้ว",
        "subDistricts": [
          {
            "name": "บ้านโพน",
            "postalCode": "47230"
          },
          {
            "name": "นาแก้ว",
            "postalCode": "47230"
          },
          {
            "name": "นาตงวัฒนา",
            "postalCode": "47230"
          },
          {
            "name": "บ้านแป้น",
            "postalCode": "47230"
          },
          {
            "name": "เชียงสือ",
            "postalCode": "47230"
          }
        ]
      },
      {
        "name": "ภูพาน",
        "subDistricts": [
          {
            "name": "สร้างค้อ",
            "postalCode": "47180"
          },
          {
            "name": "หลุบเลา",
            "postalCode": "47180"
          },
          {
            "name": "โคกภู",
            "postalCode": "47180"
          },
          {
            "name": "กกปลาซิว",
            "postalCode": "47180"
          }
        ]
      }
    ]
  },
  {
    "name": "นครพนม",
    "districts": [
      {
        "name": "เมืองนครพนม",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "48000"
          },
          {
            "name": "หนองแสง",
            "postalCode": "48000"
          },
          {
            "name": "นาทราย",
            "postalCode": "48000"
          },
          {
            "name": "นาราชควาย",
            "postalCode": "48000"
          },
          {
            "name": "กุรุคุ",
            "postalCode": "48000"
          },
          {
            "name": "บ้านผึ้ง",
            "postalCode": "48000"
          },
          {
            "name": "อาจสามารถ",
            "postalCode": "48000"
          },
          {
            "name": "ขามเฒ่า",
            "postalCode": "48000"
          },
          {
            "name": "บ้านกลาง",
            "postalCode": "48000"
          },
          {
            "name": "ท่าค้อ",
            "postalCode": "48000"
          },
          {
            "name": "คำเตย",
            "postalCode": "48000"
          },
          {
            "name": "หนองญาติ",
            "postalCode": "48000"
          },
          {
            "name": "ดงขวาง",
            "postalCode": "48000"
          },
          {
            "name": "วังตามัว",
            "postalCode": "48000"
          },
          {
            "name": "โพธิ์ตาก",
            "postalCode": "48000"
          }
        ]
      },
      {
        "name": "ปลาปาก",
        "subDistricts": [
          {
            "name": "ปลาปาก",
            "postalCode": "48160"
          },
          {
            "name": "หนองฮี",
            "postalCode": "48160"
          },
          {
            "name": "กุตาไก้",
            "postalCode": "48160"
          },
          {
            "name": "โคกสว่าง",
            "postalCode": "48160"
          },
          {
            "name": "โคกสูง",
            "postalCode": "48160"
          },
          {
            "name": "มหาชัย",
            "postalCode": "48160"
          },
          {
            "name": "นามะเขือ",
            "postalCode": "48160"
          },
          {
            "name": "หนองเทาใหญ่",
            "postalCode": "48160"
          }
        ]
      },
      {
        "name": "ท่าอุเทน",
        "subDistricts": [
          {
            "name": "ท่าอุเทน",
            "postalCode": "48120"
          },
          {
            "name": "โนนตาล",
            "postalCode": "48120"
          },
          {
            "name": "ท่าจำปา",
            "postalCode": "48120"
          },
          {
            "name": "ไชยบุรี",
            "postalCode": "48120"
          },
          {
            "name": "พนอม",
            "postalCode": "48120"
          },
          {
            "name": "พะทาย",
            "postalCode": "48120"
          },
          {
            "name": "เวินพระบาท",
            "postalCode": "48120"
          },
          {
            "name": "รามราช",
            "postalCode": "48120"
          },
          {
            "name": "หนองเทา",
            "postalCode": "48120"
          }
        ]
      },
      {
        "name": "บ้านแพง",
        "subDistricts": [
          {
            "name": "บ้านแพง",
            "postalCode": "48140"
          },
          {
            "name": "ไผ่ล้อม",
            "postalCode": "48140"
          },
          {
            "name": "โพนทอง",
            "postalCode": "48140"
          },
          {
            "name": "หนองแวง",
            "postalCode": "48140"
          },
          {
            "name": "นางัว",
            "postalCode": "48140"
          },
          {
            "name": "นาเข",
            "postalCode": "48140"
          }
        ]
      },
      {
        "name": "ธาตุพนม",
        "subDistricts": [
          {
            "name": "ธาตุพนม",
            "postalCode": "48110"
          },
          {
            "name": "ฝั่งแดง",
            "postalCode": "48110"
          },
          {
            "name": "โพนแพง",
            "postalCode": "48110"
          },
          {
            "name": "พระกลางทุ่ง",
            "postalCode": "48110"
          },
          {
            "name": "นาถ่อน",
            "postalCode": "48110"
          },
          {
            "name": "แสนพัน",
            "postalCode": "48110"
          },
          {
            "name": "ดอนนางหงส์",
            "postalCode": "48110"
          },
          {
            "name": "น้ำก่ำ",
            "postalCode": "48110"
          },
          {
            "name": "อุ่มเหม้า",
            "postalCode": "48110"
          },
          {
            "name": "นาหนาด",
            "postalCode": "48110"
          },
          {
            "name": "กุดฉิม",
            "postalCode": "48110"
          },
          {
            "name": "ธาตุพนมเหนือ",
            "postalCode": "48110"
          }
        ]
      },
      {
        "name": "เรณูนคร",
        "subDistricts": [
          {
            "name": "เรณู",
            "postalCode": "48170"
          },
          {
            "name": "โพนทอง",
            "postalCode": "48170"
          },
          {
            "name": "ท่าลาด",
            "postalCode": "48170"
          },
          {
            "name": "นางาม",
            "postalCode": "48170"
          },
          {
            "name": "โคกหินแฮ่",
            "postalCode": "48170"
          },
          {
            "name": "หนองย่างชิ้น",
            "postalCode": "48170"
          },
          {
            "name": "เรณูใต้",
            "postalCode": "48170"
          },
          {
            "name": "นาขาม",
            "postalCode": "48170"
          }
        ]
      },
      {
        "name": "นาแก",
        "subDistricts": [
          {
            "name": "นาแก",
            "postalCode": "48130"
          },
          {
            "name": "พระซอง",
            "postalCode": "48130"
          },
          {
            "name": "หนองสังข์",
            "postalCode": "48130"
          },
          {
            "name": "นาคู่",
            "postalCode": "48130"
          },
          {
            "name": "พิมาน",
            "postalCode": "48130"
          },
          {
            "name": "พุ่มแก",
            "postalCode": "48130"
          },
          {
            "name": "ก้านเหลือง",
            "postalCode": "48130"
          },
          {
            "name": "หนองบ่อ",
            "postalCode": "48130"
          },
          {
            "name": "นาเลียง",
            "postalCode": "48130"
          },
          {
            "name": "บ้านแก้ง",
            "postalCode": "48130"
          },
          {
            "name": "คำพี้",
            "postalCode": "48130"
          },
          {
            "name": "สีชมพู",
            "postalCode": "48130"
          }
        ]
      },
      {
        "name": "ศรีสงคราม",
        "subDistricts": [
          {
            "name": "ศรีสงคราม",
            "postalCode": "48150"
          },
          {
            "name": "นาเดื่อ",
            "postalCode": "48150"
          },
          {
            "name": "บ้านเอื้อง",
            "postalCode": "48150"
          },
          {
            "name": "สามผง",
            "postalCode": "48150"
          },
          {
            "name": "ท่าบ่อสงคราม",
            "postalCode": "48150"
          },
          {
            "name": "บ้านข่า",
            "postalCode": "48150"
          },
          {
            "name": "นาคำ",
            "postalCode": "48150"
          },
          {
            "name": "โพนสว่าง",
            "postalCode": "48150"
          },
          {
            "name": "หาดแพง",
            "postalCode": "48150"
          }
        ]
      },
      {
        "name": "นาหว้า",
        "subDistricts": [
          {
            "name": "นาหว้า",
            "postalCode": "48180"
          },
          {
            "name": "นางัว",
            "postalCode": "48180"
          },
          {
            "name": "บ้านเสียว",
            "postalCode": "48180"
          },
          {
            "name": "นาคูณใหญ่",
            "postalCode": "48180"
          },
          {
            "name": "เหล่าพัฒนา",
            "postalCode": "48180"
          },
          {
            "name": "ท่าเรือ",
            "postalCode": "48180"
          }
        ]
      },
      {
        "name": "โพนสวรรค์",
        "subDistricts": [
          {
            "name": "โพนสวรรค์",
            "postalCode": "48190"
          },
          {
            "name": "นาหัวบ่อ",
            "postalCode": "48190"
          },
          {
            "name": "นาขมิ้น",
            "postalCode": "48190"
          },
          {
            "name": "โพนบก",
            "postalCode": "48190"
          },
          {
            "name": "บ้านค้อ",
            "postalCode": "48190"
          },
          {
            "name": "โพนจาน",
            "postalCode": "48190"
          },
          {
            "name": "นาใน",
            "postalCode": "48190"
          }
        ]
      },
      {
        "name": "นาทม",
        "subDistricts": [
          {
            "name": "นาทม",
            "postalCode": "48140"
          },
          {
            "name": "หนองซน",
            "postalCode": "48140"
          },
          {
            "name": "ดอนเตย",
            "postalCode": "48140"
          }
        ]
      },
      {
        "name": "วังยาง",
        "subDistricts": [
          {
            "name": "วังยาง",
            "postalCode": "48130"
          },
          {
            "name": "โคกสี",
            "postalCode": "48130"
          },
          {
            "name": "ยอดชาด",
            "postalCode": "48130"
          },
          {
            "name": "หนองโพธิ์",
            "postalCode": "48130"
          }
        ]
      }
    ]
  },
  {
    "name": "มุกดาหาร",
    "districts": [
      {
        "name": "เมืองมุกดาหาร",
        "subDistricts": [
          {
            "name": "มุกดาหาร",
            "postalCode": "49000"
          },
          {
            "name": "ศรีบุญเรือง",
            "postalCode": "49000"
          },
          {
            "name": "บ้านโคก",
            "postalCode": "49000"
          },
          {
            "name": "บางทรายใหญ่",
            "postalCode": "49000"
          },
          {
            "name": "โพนทราย",
            "postalCode": "49000"
          },
          {
            "name": "ผึ่งแดด",
            "postalCode": "49000"
          },
          {
            "name": "นาโสก",
            "postalCode": "49000"
          },
          {
            "name": "นาสีนวน",
            "postalCode": "49000"
          },
          {
            "name": "คำป่าหลาย",
            "postalCode": "49000"
          },
          {
            "name": "คำอาฮวน",
            "postalCode": "49000"
          },
          {
            "name": "ดงเย็น",
            "postalCode": "49000"
          },
          {
            "name": "ดงมอน",
            "postalCode": "49000"
          },
          {
            "name": "กุดแข้",
            "postalCode": "49000"
          }
        ]
      },
      {
        "name": "นิคมคำสร้อย",
        "subDistricts": [
          {
            "name": "นิคมคำสร้อย",
            "postalCode": "49130"
          },
          {
            "name": "นากอก",
            "postalCode": "49130"
          },
          {
            "name": "หนองแวง",
            "postalCode": "49130"
          },
          {
            "name": "กกแดง",
            "postalCode": "49130"
          },
          {
            "name": "นาอุดม",
            "postalCode": "49130"
          },
          {
            "name": "โชคชัย",
            "postalCode": "49130"
          },
          {
            "name": "ร่มเกล้า",
            "postalCode": "49130"
          }
        ]
      },
      {
        "name": "ดอนตาล",
        "subDistricts": [
          {
            "name": "ดอนตาล",
            "postalCode": "49120"
          },
          {
            "name": "โพธิ์ไทร",
            "postalCode": "49120"
          },
          {
            "name": "ป่าไร่",
            "postalCode": "49120"
          },
          {
            "name": "เหล่าหมี",
            "postalCode": "49120"
          },
          {
            "name": "บ้านบาก",
            "postalCode": "49120"
          },
          {
            "name": "นาสะเม็ง",
            "postalCode": "49120"
          },
          {
            "name": "บ้านแก้ง",
            "postalCode": "49120"
          }
        ]
      },
      {
        "name": "ดงหลวง",
        "subDistricts": [
          {
            "name": "ดงหลวง",
            "postalCode": "49140"
          },
          {
            "name": "หนองบัว",
            "postalCode": "49140"
          },
          {
            "name": "กกตูม",
            "postalCode": "49140"
          },
          {
            "name": "หนองแคน",
            "postalCode": "49140"
          },
          {
            "name": "ชะโนดน้อย",
            "postalCode": "49140"
          },
          {
            "name": "พังแดง",
            "postalCode": "49140"
          }
        ]
      },
      {
        "name": "คำชะอี",
        "subDistricts": [
          {
            "name": "บ้านซ่ง",
            "postalCode": "49110"
          },
          {
            "name": "คำชะอี",
            "postalCode": "49110"
          },
          {
            "name": "หนองเอี่ยน",
            "postalCode": "49110"
          },
          {
            "name": "บ้านค้อ",
            "postalCode": "49110"
          },
          {
            "name": "บ้านเหล่า",
            "postalCode": "49110"
          },
          {
            "name": "โพนงาม",
            "postalCode": "49110"
          },
          {
            "name": "เหล่าสร้างถ่อ",
            "postalCode": "49110"
          },
          {
            "name": "คำบก",
            "postalCode": "49110"
          },
          {
            "name": "น้ำเที่ยง",
            "postalCode": "49110"
          }
        ]
      },
      {
        "name": "หว้านใหญ่",
        "subDistricts": [
          {
            "name": "หว้านใหญ่",
            "postalCode": "49150"
          },
          {
            "name": "ป่งขาม",
            "postalCode": "49150"
          },
          {
            "name": "บางทรายน้อย",
            "postalCode": "49150"
          },
          {
            "name": "ชะโนด",
            "postalCode": "49150"
          },
          {
            "name": "ดงหมู",
            "postalCode": "49150"
          }
        ]
      },
      {
        "name": "หนองสูง",
        "subDistricts": [
          {
            "name": "หนองสูง",
            "postalCode": "49160"
          },
          {
            "name": "โนนยาง",
            "postalCode": "49160"
          },
          {
            "name": "ภูวง",
            "postalCode": "49160"
          },
          {
            "name": "บ้านเป้า",
            "postalCode": "49160"
          },
          {
            "name": "หนองสูงใต้",
            "postalCode": "49160"
          },
          {
            "name": "หนองสูงเหนือ",
            "postalCode": "49160"
          }
        ]
      }
    ]
  },
  {
    "name": "เชียงใหม่",
    "districts": [
      {
        "name": "เมืองเชียงใหม่",
        "subDistricts": [
          {
            "name": "ศรีภูมิ",
            "postalCode": "50200"
          },
          {
            "name": "พระสิงห์",
            "postalCode": "50200"
          },
          {
            "name": "หายยา",
            "postalCode": "50100"
          },
          {
            "name": "ช้างม่อย",
            "postalCode": "50300"
          },
          {
            "name": "ช้างคลาน",
            "postalCode": "50100"
          },
          {
            "name": "วัดเกต",
            "postalCode": "50000"
          },
          {
            "name": "ช้างเผือก",
            "postalCode": "50300"
          },
          {
            "name": "สุเทพ",
            "postalCode": "50200"
          },
          {
            "name": "แม่เหียะ",
            "postalCode": "50100"
          },
          {
            "name": "ป่าแดด",
            "postalCode": "50100"
          },
          {
            "name": "หนองหอย",
            "postalCode": "50000"
          },
          {
            "name": "ท่าศาลา",
            "postalCode": "50000"
          },
          {
            "name": "หนองป่าครั่ง",
            "postalCode": "50000"
          },
          {
            "name": "ฟ้าฮ่าม",
            "postalCode": "50000"
          },
          {
            "name": "ป่าตัน",
            "postalCode": "50300"
          },
          {
            "name": "สันผีเสื้อ",
            "postalCode": "50300"
          }
        ]
      },
      {
        "name": "จอมทอง",
        "subDistricts": [
          {
            "name": "บ้านหลวง",
            "postalCode": "50160"
          },
          {
            "name": "ข่วงเปา",
            "postalCode": "50160"
          },
          {
            "name": "สบเตี๊ยะ",
            "postalCode": "50160"
          },
          {
            "name": "บ้านแปะ",
            "postalCode": "50240"
          },
          {
            "name": "ดอยแก้ว",
            "postalCode": "50160"
          },
          {
            "name": "แม่สอย",
            "postalCode": "50240"
          }
        ]
      },
      {
        "name": "แม่แจ่ม",
        "subDistricts": [
          {
            "name": "ช่างเคิ่ง",
            "postalCode": "50270"
          },
          {
            "name": "ท่าผา",
            "postalCode": "50270"
          },
          {
            "name": "บ้านทับ",
            "postalCode": "50270"
          },
          {
            "name": "แม่ศึก",
            "postalCode": "50270"
          },
          {
            "name": "แม่นาจร",
            "postalCode": "50270"
          },
          {
            "name": "ปางหินฝน",
            "postalCode": "50270"
          },
          {
            "name": "กองแขก",
            "postalCode": "50270"
          }
        ]
      },
      {
        "name": "เชียงดาว",
        "subDistricts": [
          {
            "name": "เชียงดาว",
            "postalCode": "50170"
          },
          {
            "name": "เมืองนะ",
            "postalCode": "50170"
          },
          {
            "name": "เมืองงาย",
            "postalCode": "50170"
          },
          {
            "name": "แม่นะ",
            "postalCode": "50170"
          },
          {
            "name": "เมืองคอง",
            "postalCode": "50170"
          },
          {
            "name": "ปิงโค้ง",
            "postalCode": "50170"
          },
          {
            "name": "ทุ่งข้าวพวง",
            "postalCode": "50170"
          }
        ]
      },
      {
        "name": "ดอยสะเก็ด",
        "subDistricts": [
          {
            "name": "เชิงดอย",
            "postalCode": "50220"
          },
          {
            "name": "สันปูเลย",
            "postalCode": "50220"
          },
          {
            "name": "ลวงเหนือ",
            "postalCode": "50220"
          },
          {
            "name": "ป่าป้อง",
            "postalCode": "50220"
          },
          {
            "name": "สง่าบ้าน",
            "postalCode": "50220"
          },
          {
            "name": "ป่าลาน",
            "postalCode": "50220"
          },
          {
            "name": "ตลาดขวัญ",
            "postalCode": "50220"
          },
          {
            "name": "สำราญราษฎร์",
            "postalCode": "50220"
          },
          {
            "name": "แม่คือ",
            "postalCode": "50220"
          },
          {
            "name": "ตลาดใหญ่",
            "postalCode": "50220"
          },
          {
            "name": "แม่ฮ้อยเงิน",
            "postalCode": "50220"
          },
          {
            "name": "แม่โป่ง",
            "postalCode": "50220"
          },
          {
            "name": "ป่าเมี่ยง",
            "postalCode": "50220"
          },
          {
            "name": "เทพเสด็จ",
            "postalCode": "50220"
          }
        ]
      },
      {
        "name": "แม่แตง",
        "subDistricts": [
          {
            "name": "สันมหาพน",
            "postalCode": "50150"
          },
          {
            "name": "แม่แตง",
            "postalCode": "50150"
          },
          {
            "name": "ขี้เหล็ก",
            "postalCode": "50150"
          },
          {
            "name": "ช่อแล",
            "postalCode": "50150"
          },
          {
            "name": "แม่หอพระ",
            "postalCode": "50150"
          },
          {
            "name": "สบเปิง",
            "postalCode": "50150"
          },
          {
            "name": "บ้านเป้า",
            "postalCode": "50150"
          },
          {
            "name": "สันป่ายาง",
            "postalCode": "50330"
          },
          {
            "name": "ป่าแป๋",
            "postalCode": "50150"
          },
          {
            "name": "เมืองก๋าย",
            "postalCode": "50150"
          },
          {
            "name": "บ้านช้าง",
            "postalCode": "50150"
          },
          {
            "name": "กื้ดช้าง",
            "postalCode": "50150"
          },
          {
            "name": "อินทขิล",
            "postalCode": "50150"
          },
          {
            "name": "สมก๋าย",
            "postalCode": "50150"
          }
        ]
      },
      {
        "name": "แม่ริม",
        "subDistricts": [
          {
            "name": "ริมใต้",
            "postalCode": "50180"
          },
          {
            "name": "ริมเหนือ",
            "postalCode": "50180"
          },
          {
            "name": "สันโป่ง",
            "postalCode": "50180"
          },
          {
            "name": "ขี้เหล็ก",
            "postalCode": "50180"
          },
          {
            "name": "สะลวง",
            "postalCode": "50330"
          },
          {
            "name": "ห้วยทราย",
            "postalCode": "50180"
          },
          {
            "name": "แม่แรม",
            "postalCode": "50180"
          },
          {
            "name": "โป่งแยง",
            "postalCode": "50180"
          },
          {
            "name": "แม่สา",
            "postalCode": "50180"
          },
          {
            "name": "ดอนแก้ว",
            "postalCode": "50180"
          },
          {
            "name": "เหมืองแก้ว",
            "postalCode": "50180"
          }
        ]
      },
      {
        "name": "สะเมิง",
        "subDistricts": [
          {
            "name": "สะเมิงใต้",
            "postalCode": "50250"
          },
          {
            "name": "สะเมิงเหนือ",
            "postalCode": "50250"
          },
          {
            "name": "แม่สาบ",
            "postalCode": "50250"
          },
          {
            "name": "บ่อแก้ว",
            "postalCode": "50250"
          },
          {
            "name": "ยั้งเมิน",
            "postalCode": "50250"
          }
        ]
      },
      {
        "name": "ฝาง",
        "subDistricts": [
          {
            "name": "เวียง",
            "postalCode": "50110"
          },
          {
            "name": "ม่อนปิ่น",
            "postalCode": "50110"
          },
          {
            "name": "แม่งอน",
            "postalCode": "50320"
          },
          {
            "name": "แม่สูน",
            "postalCode": "50110"
          },
          {
            "name": "สันทราย",
            "postalCode": "50110"
          },
          {
            "name": "แม่คะ",
            "postalCode": "50110"
          },
          {
            "name": "แม่ข่า",
            "postalCode": "50320"
          },
          {
            "name": "โป่งน้ำร้อน",
            "postalCode": "50110"
          }
        ]
      },
      {
        "name": "แม่อาย",
        "subDistricts": [
          {
            "name": "แม่อาย",
            "postalCode": "50280"
          },
          {
            "name": "แม่สาว",
            "postalCode": "50280"
          },
          {
            "name": "สันต้นหมื้อ",
            "postalCode": "50280"
          },
          {
            "name": "แม่นาวาง",
            "postalCode": "50280"
          },
          {
            "name": "ท่าตอน",
            "postalCode": "50280"
          },
          {
            "name": "บ้านหลวง",
            "postalCode": "50280"
          },
          {
            "name": "มะลิกา",
            "postalCode": "50280"
          }
        ]
      },
      {
        "name": "พร้าว",
        "subDistricts": [
          {
            "name": "เวียง",
            "postalCode": "50190"
          },
          {
            "name": "ทุ่งหลวง",
            "postalCode": "50190"
          },
          {
            "name": "ป่าตุ้ม",
            "postalCode": "50190"
          },
          {
            "name": "ป่าไหน่",
            "postalCode": "50190"
          },
          {
            "name": "สันทราย",
            "postalCode": "50190"
          },
          {
            "name": "บ้านโป่ง",
            "postalCode": "50190"
          },
          {
            "name": "น้ำแพร่",
            "postalCode": "50190"
          },
          {
            "name": "เขื่อนผาก",
            "postalCode": "50190"
          },
          {
            "name": "แม่แวน",
            "postalCode": "50190"
          },
          {
            "name": "แม่ปั๋ง",
            "postalCode": "50190"
          },
          {
            "name": "โหล่งขอด",
            "postalCode": "50190"
          }
        ]
      },
      {
        "name": "สันป่าตอง",
        "subDistricts": [
          {
            "name": "ยุหว่า",
            "postalCode": "50120"
          },
          {
            "name": "สันกลาง",
            "postalCode": "50120"
          },
          {
            "name": "ท่าวังพร้าว",
            "postalCode": "50120"
          },
          {
            "name": "มะขามหลวง",
            "postalCode": "50120"
          },
          {
            "name": "แม่ก๊า",
            "postalCode": "50120"
          },
          {
            "name": "บ้านแม",
            "postalCode": "50120"
          },
          {
            "name": "บ้านกลาง",
            "postalCode": "50120"
          },
          {
            "name": "ทุ่งสะโตก",
            "postalCode": "50120"
          },
          {
            "name": "ทุ่งต้อม",
            "postalCode": "50120"
          },
          {
            "name": "น้ำบ่อหลวง",
            "postalCode": "50120"
          },
          {
            "name": "มะขุนหวาน",
            "postalCode": "50120"
          }
        ]
      },
      {
        "name": "สันกำแพง",
        "subDistricts": [
          {
            "name": "สันกำแพง",
            "postalCode": "50130"
          },
          {
            "name": "ทรายมูล",
            "postalCode": "50130"
          },
          {
            "name": "ร้องวัวแดง",
            "postalCode": "50130"
          },
          {
            "name": "บวกค้าง",
            "postalCode": "50130"
          },
          {
            "name": "แช่ช้าง",
            "postalCode": "50130"
          },
          {
            "name": "ออนใต้",
            "postalCode": "50130"
          },
          {
            "name": "แม่ปูคา",
            "postalCode": "50130"
          },
          {
            "name": "ห้วยทราย",
            "postalCode": "50130"
          },
          {
            "name": "ต้นเปา",
            "postalCode": "50130"
          },
          {
            "name": "สันกลาง",
            "postalCode": "50130"
          }
        ]
      },
      {
        "name": "สันทราย",
        "subDistricts": [
          {
            "name": "สันทรายหลวง",
            "postalCode": "50210"
          },
          {
            "name": "สันทรายน้อย",
            "postalCode": "50210"
          },
          {
            "name": "สันพระเนตร",
            "postalCode": "50210"
          },
          {
            "name": "สันนาเม็ง",
            "postalCode": "50210"
          },
          {
            "name": "สันป่าเปา",
            "postalCode": "50210"
          },
          {
            "name": "หนองแหย่ง",
            "postalCode": "50210"
          },
          {
            "name": "หนองจ๊อม",
            "postalCode": "50210"
          },
          {
            "name": "หนองหาร",
            "postalCode": "50290"
          },
          {
            "name": "แม่แฝก",
            "postalCode": "50290"
          },
          {
            "name": "แม่แฝกใหม่",
            "postalCode": "50290"
          },
          {
            "name": "เมืองเล็น",
            "postalCode": "50210"
          },
          {
            "name": "ป่าไผ่",
            "postalCode": "50210"
          }
        ]
      },
      {
        "name": "หางดง",
        "subDistricts": [
          {
            "name": "หางดง",
            "postalCode": "50230"
          },
          {
            "name": "หนองแก๋ว",
            "postalCode": "50230"
          },
          {
            "name": "หารแก้ว",
            "postalCode": "50230"
          },
          {
            "name": "หนองตอง",
            "postalCode": "50340"
          },
          {
            "name": "ขุนคง",
            "postalCode": "50230"
          },
          {
            "name": "สบแม่ข่า",
            "postalCode": "50230"
          },
          {
            "name": "บ้านแหวน",
            "postalCode": "50230"
          },
          {
            "name": "สันผักหวาน",
            "postalCode": "50230"
          },
          {
            "name": "หนองควาย",
            "postalCode": "50230"
          },
          {
            "name": "บ้านปง",
            "postalCode": "50230"
          },
          {
            "name": "น้ำแพร่",
            "postalCode": "50230"
          }
        ]
      },
      {
        "name": "ฮอด",
        "subDistricts": [
          {
            "name": "หางดง",
            "postalCode": "50240"
          },
          {
            "name": "ฮอด",
            "postalCode": "50240"
          },
          {
            "name": "บ้านตาล",
            "postalCode": "50240"
          },
          {
            "name": "บ่อหลวง",
            "postalCode": "50240"
          },
          {
            "name": "บ่อสลี",
            "postalCode": "50240"
          },
          {
            "name": "นาคอเรือ",
            "postalCode": "50240"
          }
        ]
      },
      {
        "name": "ดอยเต่า",
        "subDistricts": [
          {
            "name": "ดอยเต่า",
            "postalCode": "50260"
          },
          {
            "name": "ท่าเดื่อ",
            "postalCode": "50260"
          },
          {
            "name": "มืดกา",
            "postalCode": "50260"
          },
          {
            "name": "บ้านแอ่น",
            "postalCode": "50260"
          },
          {
            "name": "บงตัน",
            "postalCode": "50260"
          },
          {
            "name": "โปงทุ่ง",
            "postalCode": "50260"
          }
        ]
      },
      {
        "name": "อมก๋อย",
        "subDistricts": [
          {
            "name": "อมก๋อย",
            "postalCode": "50310"
          },
          {
            "name": "ยางเปียง",
            "postalCode": "50310"
          },
          {
            "name": "แม่ตื่น",
            "postalCode": "50310"
          },
          {
            "name": "ม่อนจอง",
            "postalCode": "50310"
          },
          {
            "name": "สบโขง",
            "postalCode": "50310"
          },
          {
            "name": "นาเกียน",
            "postalCode": "50310"
          }
        ]
      },
      {
        "name": "สารภี",
        "subDistricts": [
          {
            "name": "ยางเนิ้ง",
            "postalCode": "50140"
          },
          {
            "name": "สารภี",
            "postalCode": "50140"
          },
          {
            "name": "ชมภู",
            "postalCode": "50140"
          },
          {
            "name": "ไชยสถาน",
            "postalCode": "50140"
          },
          {
            "name": "ขัวมุง",
            "postalCode": "50140"
          },
          {
            "name": "หนองแฝก",
            "postalCode": "50140"
          },
          {
            "name": "หนองผึ้ง",
            "postalCode": "50140"
          },
          {
            "name": "ท่ากว้าง",
            "postalCode": "50140"
          },
          {
            "name": "ดอนแก้ว",
            "postalCode": "50140"
          },
          {
            "name": "ท่าวังตาล",
            "postalCode": "50140"
          },
          {
            "name": "สันทราย",
            "postalCode": "50140"
          },
          {
            "name": "ป่าบง",
            "postalCode": "50140"
          }
        ]
      },
      {
        "name": "เวียงแหง",
        "subDistricts": [
          {
            "name": "เมืองแหง",
            "postalCode": "50350"
          },
          {
            "name": "เปียงหลวง",
            "postalCode": "50350"
          },
          {
            "name": "แสนไห",
            "postalCode": "50350"
          }
        ]
      },
      {
        "name": "ไชยปราการ",
        "subDistricts": [
          {
            "name": "ปงตำ",
            "postalCode": "50320"
          },
          {
            "name": "ศรีดงเย็น",
            "postalCode": "50320"
          },
          {
            "name": "แม่ทะลบ",
            "postalCode": "50320"
          },
          {
            "name": "หนองบัว",
            "postalCode": "50320"
          }
        ]
      },
      {
        "name": "แม่วาง",
        "subDistricts": [
          {
            "name": "บ้านกาด",
            "postalCode": "50360"
          },
          {
            "name": "ทุ่งปี้",
            "postalCode": "50360"
          },
          {
            "name": "ทุ่งรวงทอง",
            "postalCode": "50360"
          },
          {
            "name": "แม่วิน",
            "postalCode": "50360"
          },
          {
            "name": "ดอนเปา",
            "postalCode": "50360"
          }
        ]
      },
      {
        "name": "แม่ออน",
        "subDistricts": [
          {
            "name": "ออนเหนือ",
            "postalCode": "50130"
          },
          {
            "name": "ออนกลาง",
            "postalCode": "50130"
          },
          {
            "name": "บ้านสหกรณ์",
            "postalCode": "50130"
          },
          {
            "name": "ห้วยแก้ว",
            "postalCode": "50130"
          },
          {
            "name": "แม่ทา",
            "postalCode": "50130"
          },
          {
            "name": "ทาเหนือ",
            "postalCode": "50130"
          }
        ]
      },
      {
        "name": "ดอยหล่อ",
        "subDistricts": [
          {
            "name": "ดอยหล่อ",
            "postalCode": "50160"
          },
          {
            "name": "สองแคว",
            "postalCode": "50160"
          },
          {
            "name": "ยางคราม",
            "postalCode": "50160"
          },
          {
            "name": "สันติสุข",
            "postalCode": "50160"
          }
        ]
      },
      {
        "name": "กัลยาณิวัฒนา",
        "subDistricts": [
          {
            "name": "บ้านจันทร์",
            "postalCode": "58130"
          },
          {
            "name": "แม่แดด",
            "postalCode": "50250"
          },
          {
            "name": "แจ่มหลวง",
            "postalCode": "58130"
          }
        ]
      }
    ]
  },
  {
    "name": "ลำพูน",
    "districts": [
      {
        "name": "เมืองลำพูน",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "51000"
          },
          {
            "name": "เหมืองง่า",
            "postalCode": "51000"
          },
          {
            "name": "อุโมงค์",
            "postalCode": "51150"
          },
          {
            "name": "หนองช้างคืน",
            "postalCode": "51150"
          },
          {
            "name": "ประตูป่า",
            "postalCode": "51000"
          },
          {
            "name": "ริมปิง",
            "postalCode": "51000"
          },
          {
            "name": "ต้นธง",
            "postalCode": "51000"
          },
          {
            "name": "บ้านแป้น",
            "postalCode": "51000"
          },
          {
            "name": "เหมืองจี้",
            "postalCode": "51000"
          },
          {
            "name": "ป่าสัก",
            "postalCode": "51000"
          },
          {
            "name": "เวียงยอง",
            "postalCode": "51000"
          },
          {
            "name": "บ้านกลาง",
            "postalCode": "51000"
          },
          {
            "name": "มะเขือแจ้",
            "postalCode": "51000"
          },
          {
            "name": "ศรีบัวบาน",
            "postalCode": "51000"
          },
          {
            "name": "หนองหนาม",
            "postalCode": "51000"
          }
        ]
      },
      {
        "name": "แม่ทา",
        "subDistricts": [
          {
            "name": "ทาปลาดุก",
            "postalCode": "51140"
          },
          {
            "name": "ทาสบเส้า",
            "postalCode": "51140"
          },
          {
            "name": "ทากาศ",
            "postalCode": "51170"
          },
          {
            "name": "ทาขุมเงิน",
            "postalCode": "51170"
          },
          {
            "name": "ทาทุ่งหลวง",
            "postalCode": "51170"
          },
          {
            "name": "ทาแม่ลอบ",
            "postalCode": "51170"
          }
        ]
      },
      {
        "name": "บ้านโฮ่ง",
        "subDistricts": [
          {
            "name": "บ้านโฮ่ง",
            "postalCode": "51130"
          },
          {
            "name": "ป่าพลู",
            "postalCode": "51130"
          },
          {
            "name": "เหล่ายาว",
            "postalCode": "51130"
          },
          {
            "name": "ศรีเตี้ย",
            "postalCode": "51130"
          },
          {
            "name": "หนองปลาสะวาย",
            "postalCode": "51130"
          }
        ]
      },
      {
        "name": "ลี้",
        "subDistricts": [
          {
            "name": "ลี้",
            "postalCode": "51110"
          },
          {
            "name": "แม่ตืน",
            "postalCode": "51110"
          },
          {
            "name": "นาทราย",
            "postalCode": "51110"
          },
          {
            "name": "ดงดำ",
            "postalCode": "51110"
          },
          {
            "name": "ก้อ",
            "postalCode": "51110"
          },
          {
            "name": "แม่ลาน",
            "postalCode": "51110"
          },
          {
            "name": "ป่าไผ่",
            "postalCode": "51110"
          },
          {
            "name": "ศรีวิชัย",
            "postalCode": "51110"
          }
        ]
      },
      {
        "name": "ทุ่งหัวช้าง",
        "subDistricts": [
          {
            "name": "ทุ่งหัวช้าง",
            "postalCode": "51160"
          },
          {
            "name": "บ้านปวง",
            "postalCode": "51160"
          },
          {
            "name": "ตะเคียนปม",
            "postalCode": "51160"
          }
        ]
      },
      {
        "name": "ป่าซาง",
        "subDistricts": [
          {
            "name": "ปากบ่อง",
            "postalCode": "51120"
          },
          {
            "name": "ป่าซาง",
            "postalCode": "51120"
          },
          {
            "name": "แม่แรง",
            "postalCode": "51120"
          },
          {
            "name": "ม่วงน้อย",
            "postalCode": "51120"
          },
          {
            "name": "บ้านเรือน",
            "postalCode": "51120"
          },
          {
            "name": "มะกอก",
            "postalCode": "51120"
          },
          {
            "name": "ท่าตุ้ม",
            "postalCode": "51120"
          },
          {
            "name": "น้ำดิบ",
            "postalCode": "51120"
          },
          {
            "name": "นครเจดีย์",
            "postalCode": "51120"
          }
        ]
      },
      {
        "name": "บ้านธิ",
        "subDistricts": [
          {
            "name": "บ้านธิ",
            "postalCode": "51180"
          },
          {
            "name": "ห้วยยาบ",
            "postalCode": "51180"
          }
        ]
      },
      {
        "name": "เวียงหนองล่อง",
        "subDistricts": [
          {
            "name": "หนองล่อง",
            "postalCode": "51120"
          },
          {
            "name": "หนองยวง",
            "postalCode": "51120"
          },
          {
            "name": "วังผาง",
            "postalCode": "51120"
          }
        ]
      }
    ]
  },
  {
    "name": "ลำปาง",
    "districts": [
      {
        "name": "เมืองลำปาง",
        "subDistricts": [
          {
            "name": "เวียงเหนือ",
            "postalCode": "52000"
          },
          {
            "name": "หัวเวียง",
            "postalCode": "52000"
          },
          {
            "name": "สวนดอก",
            "postalCode": "52100"
          },
          {
            "name": "สบตุ๋ย",
            "postalCode": "52100"
          },
          {
            "name": "พระบาท",
            "postalCode": "52000"
          },
          {
            "name": "ชมพู",
            "postalCode": "52100"
          },
          {
            "name": "กล้วยแพะ",
            "postalCode": "52000"
          },
          {
            "name": "ปงแสนทอง",
            "postalCode": "52100"
          },
          {
            "name": "บ้านแลง",
            "postalCode": "52000"
          },
          {
            "name": "บ้านเสด็จ",
            "postalCode": "52000"
          },
          {
            "name": "พิชัย",
            "postalCode": "52000"
          },
          {
            "name": "ทุ่งฝาย",
            "postalCode": "52000"
          },
          {
            "name": "บ้านเอื้อม",
            "postalCode": "52100"
          },
          {
            "name": "บ้านเป้า",
            "postalCode": "52100"
          },
          {
            "name": "บ้านค่า",
            "postalCode": "52100"
          },
          {
            "name": "บ่อแฮ้ว",
            "postalCode": "52100"
          },
          {
            "name": "ต้นธงชัย",
            "postalCode": "52000"
          },
          {
            "name": "นิคมพัฒนา",
            "postalCode": "52000"
          },
          {
            "name": "บุญนาคพัฒนา",
            "postalCode": "52000"
          }
        ]
      },
      {
        "name": "แม่เมาะ",
        "subDistricts": [
          {
            "name": "บ้านดง",
            "postalCode": "52220"
          },
          {
            "name": "นาสัก",
            "postalCode": "52220"
          },
          {
            "name": "จางเหนือ",
            "postalCode": "52220"
          },
          {
            "name": "แม่เมาะ",
            "postalCode": "52220"
          },
          {
            "name": "สบป้าด",
            "postalCode": "52220"
          }
        ]
      },
      {
        "name": "เกาะคา",
        "subDistricts": [
          {
            "name": "ลำปางหลวง",
            "postalCode": "52130"
          },
          {
            "name": "นาแก้ว",
            "postalCode": "52130"
          },
          {
            "name": "ไหล่หิน",
            "postalCode": "52130"
          },
          {
            "name": "วังพร้าว",
            "postalCode": "52130"
          },
          {
            "name": "ศาลา",
            "postalCode": "52130"
          },
          {
            "name": "เกาะคา",
            "postalCode": "52130"
          },
          {
            "name": "นาแส่ง",
            "postalCode": "52130"
          },
          {
            "name": "ท่าผา",
            "postalCode": "52130"
          },
          {
            "name": "ใหม่พัฒนา",
            "postalCode": "52130"
          }
        ]
      },
      {
        "name": "เสริมงาม",
        "subDistricts": [
          {
            "name": "ทุ่งงาม",
            "postalCode": "52210"
          },
          {
            "name": "เสริมขวา",
            "postalCode": "52210"
          },
          {
            "name": "เสริมซ้าย",
            "postalCode": "52210"
          },
          {
            "name": "เสริมกลาง",
            "postalCode": "52210"
          }
        ]
      },
      {
        "name": "งาว",
        "subDistricts": [
          {
            "name": "หลวงเหนือ",
            "postalCode": "52110"
          },
          {
            "name": "หลวงใต้",
            "postalCode": "52110"
          },
          {
            "name": "บ้านโป่ง",
            "postalCode": "52110"
          },
          {
            "name": "บ้านร้อง",
            "postalCode": "52110"
          },
          {
            "name": "ปงเตา",
            "postalCode": "52110"
          },
          {
            "name": "นาแก",
            "postalCode": "52110"
          },
          {
            "name": "บ้านอ้อน",
            "postalCode": "52110"
          },
          {
            "name": "บ้านแหง",
            "postalCode": "52110"
          },
          {
            "name": "บ้านหวด",
            "postalCode": "52110"
          },
          {
            "name": "แม่ตีบ",
            "postalCode": "52110"
          }
        ]
      },
      {
        "name": "แจ้ห่ม",
        "subDistricts": [
          {
            "name": "แจ้ห่ม",
            "postalCode": "52120"
          },
          {
            "name": "บ้านสา",
            "postalCode": "52120"
          },
          {
            "name": "ปงดอน",
            "postalCode": "52120"
          },
          {
            "name": "แม่สุก",
            "postalCode": "52120"
          },
          {
            "name": "เมืองมาย",
            "postalCode": "52120"
          },
          {
            "name": "ทุ่งผึ้ง",
            "postalCode": "52120"
          },
          {
            "name": "วิเชตนคร",
            "postalCode": "52120"
          }
        ]
      },
      {
        "name": "วังเหนือ",
        "subDistricts": [
          {
            "name": "ทุ่งฮั้ว",
            "postalCode": "52140"
          },
          {
            "name": "วังเหนือ",
            "postalCode": "52140"
          },
          {
            "name": "วังใต้",
            "postalCode": "52140"
          },
          {
            "name": "ร่องเคาะ",
            "postalCode": "52140"
          },
          {
            "name": "วังทอง",
            "postalCode": "52140"
          },
          {
            "name": "วังซ้าย",
            "postalCode": "52140"
          },
          {
            "name": "วังแก้ว",
            "postalCode": "52140"
          },
          {
            "name": "วังทรายคำ",
            "postalCode": "52140"
          }
        ]
      },
      {
        "name": "เถิน",
        "subDistricts": [
          {
            "name": "ล้อมแรด",
            "postalCode": "52160"
          },
          {
            "name": "แม่วะ",
            "postalCode": "52230"
          },
          {
            "name": "แม่ปะ",
            "postalCode": "52160"
          },
          {
            "name": "แม่มอก",
            "postalCode": "52160"
          },
          {
            "name": "เวียงมอก",
            "postalCode": "52160"
          },
          {
            "name": "นาโป่ง",
            "postalCode": "52160"
          },
          {
            "name": "แม่ถอด",
            "postalCode": "52160"
          },
          {
            "name": "เถินบุรี",
            "postalCode": "52160"
          }
        ]
      },
      {
        "name": "แม่พริก",
        "subDistricts": [
          {
            "name": "แม่พริก",
            "postalCode": "52180"
          },
          {
            "name": "ผาปัง",
            "postalCode": "52180"
          },
          {
            "name": "แม่ปุ",
            "postalCode": "52180"
          },
          {
            "name": "พระบาทวังตวง",
            "postalCode": "52180"
          }
        ]
      },
      {
        "name": "แม่ทะ",
        "subDistricts": [
          {
            "name": "แม่ทะ",
            "postalCode": "52150"
          },
          {
            "name": "นาครัว",
            "postalCode": "52150"
          },
          {
            "name": "ป่าตัน",
            "postalCode": "52150"
          },
          {
            "name": "บ้านกิ่ว",
            "postalCode": "52150"
          },
          {
            "name": "บ้านบอม",
            "postalCode": "52150"
          },
          {
            "name": "น้ำโจ้",
            "postalCode": "52150"
          },
          {
            "name": "ดอนไฟ",
            "postalCode": "52150"
          },
          {
            "name": "หัวเสือ",
            "postalCode": "52150"
          },
          {
            "name": "วังเงิน",
            "postalCode": "52150"
          },
          {
            "name": "สันดอนแก้ว",
            "postalCode": "52150"
          }
        ]
      },
      {
        "name": "สบปราบ",
        "subDistricts": [
          {
            "name": "สบปราบ",
            "postalCode": "52170"
          },
          {
            "name": "สมัย",
            "postalCode": "52170"
          },
          {
            "name": "แม่กัวะ",
            "postalCode": "52170"
          },
          {
            "name": "นายาง",
            "postalCode": "52170"
          }
        ]
      },
      {
        "name": "ห้างฉัตร",
        "subDistricts": [
          {
            "name": "ห้างฉัตร",
            "postalCode": "52190"
          },
          {
            "name": "หนองหล่ม",
            "postalCode": "52190"
          },
          {
            "name": "เมืองยาว",
            "postalCode": "52190"
          },
          {
            "name": "ปงยางคก",
            "postalCode": "52190"
          },
          {
            "name": "เวียงตาล",
            "postalCode": "52190"
          },
          {
            "name": "แม่สัน",
            "postalCode": "52190"
          },
          {
            "name": "วอแก้ว",
            "postalCode": "52190"
          }
        ]
      },
      {
        "name": "เมืองปาน",
        "subDistricts": [
          {
            "name": "เมืองปาน",
            "postalCode": "52240"
          },
          {
            "name": "บ้านขอ",
            "postalCode": "52240"
          },
          {
            "name": "ทุ่งกว๋าว",
            "postalCode": "52240"
          },
          {
            "name": "แจ้ซ้อน",
            "postalCode": "52240"
          },
          {
            "name": "หัวเมือง",
            "postalCode": "52240"
          }
        ]
      }
    ]
  },
  {
    "name": "อุตรดิตถ์",
    "districts": [
      {
        "name": "เมืองอุตรดิตถ์",
        "subDistricts": [
          {
            "name": "ท่าอิฐ",
            "postalCode": "53000"
          },
          {
            "name": "ท่าเสา",
            "postalCode": "53000"
          },
          {
            "name": "บ้านเกาะ",
            "postalCode": "53000"
          },
          {
            "name": "ป่าเซ่า",
            "postalCode": "53000"
          },
          {
            "name": "คุ้งตะเภา",
            "postalCode": "53000"
          },
          {
            "name": "วังกะพี้",
            "postalCode": "53170"
          },
          {
            "name": "หาดกรวด",
            "postalCode": "53000"
          },
          {
            "name": "น้ำริด",
            "postalCode": "53000"
          },
          {
            "name": "งิ้วงาม",
            "postalCode": "53000"
          },
          {
            "name": "บ้านด่านนาขาม",
            "postalCode": "53000"
          },
          {
            "name": "บ้านด่าน",
            "postalCode": "53000"
          },
          {
            "name": "ผาจุก",
            "postalCode": "53000"
          },
          {
            "name": "วังดิน",
            "postalCode": "53000"
          },
          {
            "name": "แสนตอ",
            "postalCode": "53000"
          },
          {
            "name": "หาดงิ้ว",
            "postalCode": "53000"
          },
          {
            "name": "ขุนฝาง",
            "postalCode": "53000"
          },
          {
            "name": "ถ้ำฉลอง",
            "postalCode": "53000"
          }
        ]
      },
      {
        "name": "ตรอน",
        "subDistricts": [
          {
            "name": "วังแดง",
            "postalCode": "53140"
          },
          {
            "name": "บ้านแก่ง",
            "postalCode": "53140"
          },
          {
            "name": "หาดสองแคว",
            "postalCode": "53140"
          },
          {
            "name": "น้ำอ่าง",
            "postalCode": "53140"
          },
          {
            "name": "ข่อยสูง",
            "postalCode": "53140"
          }
        ]
      },
      {
        "name": "ท่าปลา",
        "subDistricts": [
          {
            "name": "ท่าปลา",
            "postalCode": "53150"
          },
          {
            "name": "หาดล้า",
            "postalCode": "53150"
          },
          {
            "name": "ผาเลือด",
            "postalCode": "53190"
          },
          {
            "name": "จริม",
            "postalCode": "53150"
          },
          {
            "name": "น้ำหมัน",
            "postalCode": "53150"
          },
          {
            "name": "ท่าแฝก",
            "postalCode": "53110"
          },
          {
            "name": "นางพญา",
            "postalCode": "53150"
          },
          {
            "name": "ร่วมจิต",
            "postalCode": "53190"
          }
        ]
      },
      {
        "name": "น้ำปาด",
        "subDistricts": [
          {
            "name": "แสนตอ",
            "postalCode": "53110"
          },
          {
            "name": "บ้านฝาย",
            "postalCode": "53110"
          },
          {
            "name": "เด่นเหล็ก",
            "postalCode": "53110"
          },
          {
            "name": "น้ำไคร้",
            "postalCode": "53110"
          },
          {
            "name": "น้ำไผ่",
            "postalCode": "53110"
          },
          {
            "name": "ห้วยมุ่น",
            "postalCode": "53110"
          }
        ]
      },
      {
        "name": "ฟากท่า",
        "subDistricts": [
          {
            "name": "ฟากท่า",
            "postalCode": "53160"
          },
          {
            "name": "สองคอน",
            "postalCode": "53160"
          },
          {
            "name": "บ้านเสี้ยว",
            "postalCode": "53160"
          },
          {
            "name": "สองห้อง",
            "postalCode": "53160"
          }
        ]
      },
      {
        "name": "บ้านโคก",
        "subDistricts": [
          {
            "name": "ม่วงเจ็ดต้น",
            "postalCode": "53180"
          },
          {
            "name": "บ้านโคก",
            "postalCode": "53180"
          },
          {
            "name": "นาขุม",
            "postalCode": "53180"
          },
          {
            "name": "บ่อเบี้ย",
            "postalCode": "53180"
          }
        ]
      },
      {
        "name": "พิชัย",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "53120"
          },
          {
            "name": "บ้านดารา",
            "postalCode": "53220"
          },
          {
            "name": "ไร่อ้อย",
            "postalCode": "53120"
          },
          {
            "name": "ท่าสัก",
            "postalCode": "53220"
          },
          {
            "name": "คอรุม",
            "postalCode": "53120"
          },
          {
            "name": "บ้านหม้อ",
            "postalCode": "53120"
          },
          {
            "name": "ท่ามะเฟือง",
            "postalCode": "53120"
          },
          {
            "name": "บ้านโคน",
            "postalCode": "53120"
          },
          {
            "name": "พญาแมน",
            "postalCode": "53120"
          },
          {
            "name": "นาอิน",
            "postalCode": "53120"
          },
          {
            "name": "นายาง",
            "postalCode": "53120"
          }
        ]
      },
      {
        "name": "ลับแล",
        "subDistricts": [
          {
            "name": "ศรีพนมมาศ",
            "postalCode": "53130"
          },
          {
            "name": "แม่พูล",
            "postalCode": "53130"
          },
          {
            "name": "นานกกก",
            "postalCode": "53130"
          },
          {
            "name": "ฝายหลวง",
            "postalCode": "53130"
          },
          {
            "name": "ชัยจุมพล",
            "postalCode": "53130"
          },
          {
            "name": "ไผ่ล้อม",
            "postalCode": "53210"
          },
          {
            "name": "ทุ่งยั้ง",
            "postalCode": "53210"
          },
          {
            "name": "ด่านแม่คำมัน",
            "postalCode": "53210"
          }
        ]
      },
      {
        "name": "ทองแสนขัน",
        "subDistricts": [
          {
            "name": "ผักขวง",
            "postalCode": "53230"
          },
          {
            "name": "บ่อทอง",
            "postalCode": "53230"
          },
          {
            "name": "ป่าคาย",
            "postalCode": "53230"
          },
          {
            "name": "น้ำพี้",
            "postalCode": "53230"
          }
        ]
      }
    ]
  },
  {
    "name": "แพร่",
    "districts": [
      {
        "name": "เมืองแพร่",
        "subDistricts": [
          {
            "name": "ในเวียง",
            "postalCode": "54000"
          },
          {
            "name": "นาจักร",
            "postalCode": "54000"
          },
          {
            "name": "น้ำชำ",
            "postalCode": "54000"
          },
          {
            "name": "ป่าแดง",
            "postalCode": "54000"
          },
          {
            "name": "ทุ่งโฮ้ง",
            "postalCode": "54000"
          },
          {
            "name": "เหมืองหม้อ",
            "postalCode": "54000"
          },
          {
            "name": "วังธง",
            "postalCode": "54000"
          },
          {
            "name": "แม่หล่าย",
            "postalCode": "54000"
          },
          {
            "name": "ห้วยม้า",
            "postalCode": "54000"
          },
          {
            "name": "ป่าแมต",
            "postalCode": "54000"
          },
          {
            "name": "บ้านถิ่น",
            "postalCode": "54000"
          },
          {
            "name": "สวนเขื่อน",
            "postalCode": "54000"
          },
          {
            "name": "วังหงส์",
            "postalCode": "54000"
          },
          {
            "name": "แม่คำมี",
            "postalCode": "54000"
          },
          {
            "name": "ทุ่งกวาว",
            "postalCode": "54000"
          },
          {
            "name": "ท่าข้าม",
            "postalCode": "54000"
          },
          {
            "name": "แม่ยม",
            "postalCode": "54000"
          },
          {
            "name": "ช่อแฮ",
            "postalCode": "54000"
          },
          {
            "name": "ร่องฟอง",
            "postalCode": "54000"
          },
          {
            "name": "กาญจนา",
            "postalCode": "54000"
          }
        ]
      },
      {
        "name": "ร้องกวาง",
        "subDistricts": [
          {
            "name": "ร้องกวาง",
            "postalCode": "54140"
          },
          {
            "name": "ร้องเข็ม",
            "postalCode": "54140"
          },
          {
            "name": "น้ำเลา",
            "postalCode": "54140"
          },
          {
            "name": "บ้านเวียง",
            "postalCode": "54140"
          },
          {
            "name": "ทุ่งศรี",
            "postalCode": "54140"
          },
          {
            "name": "แม่ยางตาล",
            "postalCode": "54140"
          },
          {
            "name": "แม่ยางฮ่อ",
            "postalCode": "54140"
          },
          {
            "name": "ไผ่โทน",
            "postalCode": "54140"
          },
          {
            "name": "ห้วยโรง",
            "postalCode": "54140"
          },
          {
            "name": "แม่ทราย",
            "postalCode": "54140"
          },
          {
            "name": "แม่ยางร้อง",
            "postalCode": "54140"
          }
        ]
      },
      {
        "name": "ลอง",
        "subDistricts": [
          {
            "name": "ห้วยอ้อ",
            "postalCode": "54150"
          },
          {
            "name": "บ้านปิน",
            "postalCode": "54150"
          },
          {
            "name": "ต้าผามอก",
            "postalCode": "54150"
          },
          {
            "name": "เวียงต้า",
            "postalCode": "54150"
          },
          {
            "name": "ปากกาง",
            "postalCode": "54150"
          },
          {
            "name": "หัวทุ่ง",
            "postalCode": "54150"
          },
          {
            "name": "ทุ่งแล้ง",
            "postalCode": "54150"
          },
          {
            "name": "บ่อเหล็กลอง",
            "postalCode": "54150"
          },
          {
            "name": "แม่ปาน",
            "postalCode": "54150"
          }
        ]
      },
      {
        "name": "สูงเม่น",
        "subDistricts": [
          {
            "name": "สูงเม่น",
            "postalCode": "54130"
          },
          {
            "name": "น้ำชำ",
            "postalCode": "54130"
          },
          {
            "name": "หัวฝาย",
            "postalCode": "54130"
          },
          {
            "name": "ดอนมูล",
            "postalCode": "54130"
          },
          {
            "name": "บ้านเหล่า",
            "postalCode": "54130"
          },
          {
            "name": "บ้านกวาง",
            "postalCode": "54130"
          },
          {
            "name": "บ้านปง",
            "postalCode": "54130"
          },
          {
            "name": "บ้านกาศ",
            "postalCode": "54130"
          },
          {
            "name": "ร่องกาศ",
            "postalCode": "54130"
          },
          {
            "name": "สบสาย",
            "postalCode": "54130"
          },
          {
            "name": "เวียงทอง",
            "postalCode": "54000"
          },
          {
            "name": "พระหลวง",
            "postalCode": "54130"
          }
        ]
      },
      {
        "name": "เด่นชัย",
        "subDistricts": [
          {
            "name": "เด่นชัย",
            "postalCode": "54110"
          },
          {
            "name": "แม่จั๊วะ",
            "postalCode": "54110"
          },
          {
            "name": "ไทรย้อย",
            "postalCode": "54110"
          },
          {
            "name": "ห้วยไร่",
            "postalCode": "54110"
          },
          {
            "name": "ปงป่าหวาย",
            "postalCode": "54110"
          }
        ]
      },
      {
        "name": "สอง",
        "subDistricts": [
          {
            "name": "บ้านหนุน",
            "postalCode": "54120"
          },
          {
            "name": "บ้านกลาง",
            "postalCode": "54120"
          },
          {
            "name": "ห้วยหม้าย",
            "postalCode": "54120"
          },
          {
            "name": "เตาปูน",
            "postalCode": "54120"
          },
          {
            "name": "หัวเมือง",
            "postalCode": "54120"
          },
          {
            "name": "สะเอียบ",
            "postalCode": "54120"
          },
          {
            "name": "แดนชุมพล",
            "postalCode": "54120"
          },
          {
            "name": "ทุ่งน้าว",
            "postalCode": "54120"
          }
        ]
      },
      {
        "name": "วังชิ้น",
        "subDistricts": [
          {
            "name": "วังชิ้น",
            "postalCode": "54160"
          },
          {
            "name": "สรอย",
            "postalCode": "54160"
          },
          {
            "name": "แม่ป้าก",
            "postalCode": "54160"
          },
          {
            "name": "นาพูน",
            "postalCode": "54160"
          },
          {
            "name": "แม่พุง",
            "postalCode": "54160"
          },
          {
            "name": "ป่าสัก",
            "postalCode": "54160"
          },
          {
            "name": "แม่เกิ๋ง",
            "postalCode": "54160"
          }
        ]
      },
      {
        "name": "หนองม่วงไข่",
        "subDistricts": [
          {
            "name": "แม่คำมี",
            "postalCode": "54170"
          },
          {
            "name": "หนองม่วงไข่",
            "postalCode": "54170"
          },
          {
            "name": "น้ำรัด",
            "postalCode": "54170"
          },
          {
            "name": "วังหลวง",
            "postalCode": "54170"
          },
          {
            "name": "ตำหนักธรรม",
            "postalCode": "54170"
          },
          {
            "name": "ทุ่งแค้ว",
            "postalCode": "54170"
          }
        ]
      }
    ]
  },
  {
    "name": "น่าน",
    "districts": [
      {
        "name": "เมืองน่าน",
        "subDistricts": [
          {
            "name": "ในเวียง",
            "postalCode": "55000"
          },
          {
            "name": "บ่อ",
            "postalCode": "55000"
          },
          {
            "name": "ผาสิงห์",
            "postalCode": "55000"
          },
          {
            "name": "ไชยสถาน",
            "postalCode": "55000"
          },
          {
            "name": "ถืมตอง",
            "postalCode": "55000"
          },
          {
            "name": "เรือง",
            "postalCode": "55000"
          },
          {
            "name": "นาซาว",
            "postalCode": "55000"
          },
          {
            "name": "ดู่ใต้",
            "postalCode": "55000"
          },
          {
            "name": "กองควาย",
            "postalCode": "55000"
          },
          {
            "name": "สวก",
            "postalCode": "55000"
          },
          {
            "name": "สะเนียน",
            "postalCode": "55000"
          }
        ]
      },
      {
        "name": "แม่จริม",
        "subDistricts": [
          {
            "name": "หนองแดง",
            "postalCode": "55170"
          },
          {
            "name": "หมอเมือง",
            "postalCode": "55170"
          },
          {
            "name": "น้ำพาง",
            "postalCode": "55170"
          },
          {
            "name": "น้ำปาย",
            "postalCode": "55170"
          },
          {
            "name": "แม่จริม",
            "postalCode": "55170"
          }
        ]
      },
      {
        "name": "บ้านหลวง",
        "subDistricts": [
          {
            "name": "บ้านฟ้า",
            "postalCode": "55190"
          },
          {
            "name": "ป่าคาหลวง",
            "postalCode": "55190"
          },
          {
            "name": "สวด",
            "postalCode": "55190"
          },
          {
            "name": "บ้านพี้",
            "postalCode": "55190"
          }
        ]
      },
      {
        "name": "นาน้อย",
        "subDistricts": [
          {
            "name": "นาน้อย",
            "postalCode": "55150"
          },
          {
            "name": "เชียงของ",
            "postalCode": "55150"
          },
          {
            "name": "ศรีษะเกษ",
            "postalCode": "55150"
          },
          {
            "name": "สถาน",
            "postalCode": "55150"
          },
          {
            "name": "สันทะ",
            "postalCode": "55150"
          },
          {
            "name": "บัวใหญ่",
            "postalCode": "55150"
          },
          {
            "name": "น้ำตก",
            "postalCode": "55150"
          }
        ]
      },
      {
        "name": "ปัว",
        "subDistricts": [
          {
            "name": "ปัว",
            "postalCode": "55120"
          },
          {
            "name": "แงง",
            "postalCode": "55120"
          },
          {
            "name": "สถาน",
            "postalCode": "55120"
          },
          {
            "name": "ศิลาแลง",
            "postalCode": "55120"
          },
          {
            "name": "ศิลาเพชร",
            "postalCode": "55120"
          },
          {
            "name": "อวน",
            "postalCode": "55120"
          },
          {
            "name": "ไชยวัฒนา",
            "postalCode": "55120"
          },
          {
            "name": "เจดีย์ชัย",
            "postalCode": "55120"
          },
          {
            "name": "ภูคา",
            "postalCode": "55120"
          },
          {
            "name": "สกาด",
            "postalCode": "55120"
          },
          {
            "name": "ป่ากลาง",
            "postalCode": "55120"
          },
          {
            "name": "วรนคร",
            "postalCode": "55120"
          }
        ]
      },
      {
        "name": "ท่าวังผา",
        "subDistricts": [
          {
            "name": "ริม",
            "postalCode": "55140"
          },
          {
            "name": "ป่าคา",
            "postalCode": "55140"
          },
          {
            "name": "ผาตอ",
            "postalCode": "55140"
          },
          {
            "name": "ยม",
            "postalCode": "55140"
          },
          {
            "name": "ตาลชุม",
            "postalCode": "55140"
          },
          {
            "name": "ศรีภูมิ",
            "postalCode": "55140"
          },
          {
            "name": "จอมพระ",
            "postalCode": "55140"
          },
          {
            "name": "แสนทอง",
            "postalCode": "55140"
          },
          {
            "name": "ท่าวังผา",
            "postalCode": "55140"
          },
          {
            "name": "ผาทอง",
            "postalCode": "55140"
          }
        ]
      },
      {
        "name": "เวียงสา",
        "subDistricts": [
          {
            "name": "กลางเวียง",
            "postalCode": "55110"
          },
          {
            "name": "ขึ่ง",
            "postalCode": "55110"
          },
          {
            "name": "ไหล่น่าน",
            "postalCode": "55110"
          },
          {
            "name": "ตาลชุม",
            "postalCode": "55110"
          },
          {
            "name": "นาเหลือง",
            "postalCode": "55110"
          },
          {
            "name": "ส้าน",
            "postalCode": "55110"
          },
          {
            "name": "น้ำมวบ",
            "postalCode": "55110"
          },
          {
            "name": "น้ำปั้ว",
            "postalCode": "55110"
          },
          {
            "name": "ยาบหัวนา",
            "postalCode": "55110"
          },
          {
            "name": "ปงสนุก",
            "postalCode": "55110"
          },
          {
            "name": "อ่ายนาไลย",
            "postalCode": "55110"
          },
          {
            "name": "ส้านนาหนองใหม่",
            "postalCode": "55110"
          },
          {
            "name": "แม่ขะนิง",
            "postalCode": "55110"
          },
          {
            "name": "แม่สาคร",
            "postalCode": "55110"
          },
          {
            "name": "จอมจันทร์",
            "postalCode": "55110"
          },
          {
            "name": "แม่สา",
            "postalCode": "55110"
          },
          {
            "name": "ทุ่งศรีทอง",
            "postalCode": "55110"
          }
        ]
      },
      {
        "name": "ทุ่งช้าง",
        "subDistricts": [
          {
            "name": "ปอน",
            "postalCode": "55130"
          },
          {
            "name": "งอบ",
            "postalCode": "55130"
          },
          {
            "name": "และ",
            "postalCode": "55130"
          },
          {
            "name": "ทุ่งช้าง",
            "postalCode": "55130"
          }
        ]
      },
      {
        "name": "เชียงกลาง",
        "subDistricts": [
          {
            "name": "เชียงกลาง",
            "postalCode": "55160"
          },
          {
            "name": "เปือ",
            "postalCode": "55160"
          },
          {
            "name": "เชียงคาน",
            "postalCode": "55160"
          },
          {
            "name": "พระธาตุ",
            "postalCode": "55160"
          },
          {
            "name": "พญาแก้ว",
            "postalCode": "55160"
          },
          {
            "name": "พระพุทธบาท",
            "postalCode": "55160"
          }
        ]
      },
      {
        "name": "นาหมื่น",
        "subDistricts": [
          {
            "name": "นาทะนุง",
            "postalCode": "55180"
          },
          {
            "name": "บ่อแก้ว",
            "postalCode": "55180"
          },
          {
            "name": "เมืองลี",
            "postalCode": "55180"
          },
          {
            "name": "ปิงหลวง",
            "postalCode": "55180"
          }
        ]
      },
      {
        "name": "สันติสุข",
        "subDistricts": [
          {
            "name": "ดู่พงษ์",
            "postalCode": "55210"
          },
          {
            "name": "ป่าแลวหลวง",
            "postalCode": "55210"
          },
          {
            "name": "พงษ์",
            "postalCode": "55210"
          }
        ]
      },
      {
        "name": "บ่อเกลือ",
        "subDistricts": [
          {
            "name": "บ่อเกลือเหนือ",
            "postalCode": "55220"
          },
          {
            "name": "บ่อเกลือใต้",
            "postalCode": "55220"
          },
          {
            "name": "ภูฟ้า",
            "postalCode": "55220"
          },
          {
            "name": "ดงพญา",
            "postalCode": "55220"
          }
        ]
      },
      {
        "name": "สองแคว",
        "subDistricts": [
          {
            "name": "นาไร่หลวง",
            "postalCode": "55160"
          },
          {
            "name": "ชนแดน",
            "postalCode": "55160"
          },
          {
            "name": "ยอด",
            "postalCode": "55160"
          }
        ]
      },
      {
        "name": "ภูเพียง",
        "subDistricts": [
          {
            "name": "ม่วงตึ๊ด",
            "postalCode": "55000"
          },
          {
            "name": "นาปัง",
            "postalCode": "55000"
          },
          {
            "name": "น้ำแก่น",
            "postalCode": "55000"
          },
          {
            "name": "น้ำเกี๋ยน",
            "postalCode": "55000"
          },
          {
            "name": "เมืองจัง",
            "postalCode": "55000"
          },
          {
            "name": "ท่าน้าว",
            "postalCode": "55000"
          },
          {
            "name": "ฝายแก้ว",
            "postalCode": "55000"
          }
        ]
      },
      {
        "name": "เฉลิมพระเกียรติ",
        "subDistricts": [
          {
            "name": "ห้วยโก๋น",
            "postalCode": "55130"
          },
          {
            "name": "ขุนน่าน",
            "postalCode": "55130"
          }
        ]
      }
    ]
  },
  {
    "name": "พะเยา",
    "districts": [
      {
        "name": "เมืองพะเยา",
        "subDistricts": [
          {
            "name": "เวียง",
            "postalCode": "56000"
          },
          {
            "name": "แม่ต๋ำ",
            "postalCode": "56000"
          },
          {
            "name": "แม่นาเรือ",
            "postalCode": "56000"
          },
          {
            "name": "บ้านตุ่น",
            "postalCode": "56000"
          },
          {
            "name": "บ้านต๊ำ",
            "postalCode": "56000"
          },
          {
            "name": "บ้านต๋อม",
            "postalCode": "56000"
          },
          {
            "name": "แม่ปืม",
            "postalCode": "56000"
          },
          {
            "name": "แม่กา",
            "postalCode": "56000"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "56000"
          },
          {
            "name": "จำป่าหวาย",
            "postalCode": "56000"
          },
          {
            "name": "ท่าวังทอง",
            "postalCode": "56000"
          },
          {
            "name": "แม่ใส",
            "postalCode": "56000"
          },
          {
            "name": "บ้านสาง",
            "postalCode": "56000"
          },
          {
            "name": "ท่าจำปี",
            "postalCode": "56000"
          },
          {
            "name": "สันป่าม่วง",
            "postalCode": "56000"
          }
        ]
      },
      {
        "name": "จุน",
        "subDistricts": [
          {
            "name": "ห้วยข้าวก่ำ",
            "postalCode": "56150"
          },
          {
            "name": "จุน",
            "postalCode": "56150"
          },
          {
            "name": "ลอ",
            "postalCode": "56150"
          },
          {
            "name": "หงส์หิน",
            "postalCode": "56150"
          },
          {
            "name": "ทุ่งรวงทอง",
            "postalCode": "56150"
          },
          {
            "name": "ห้วยยางขาม",
            "postalCode": "56150"
          },
          {
            "name": "พระธาตุขิงแกง",
            "postalCode": "56150"
          }
        ]
      },
      {
        "name": "เชียงคำ",
        "subDistricts": [
          {
            "name": "หย่วน",
            "postalCode": "56110"
          },
          {
            "name": "น้ำแวน",
            "postalCode": "56110"
          },
          {
            "name": "เวียง",
            "postalCode": "56110"
          },
          {
            "name": "ฝายกวาง",
            "postalCode": "56110"
          },
          {
            "name": "เจดีย์คำ",
            "postalCode": "56110"
          },
          {
            "name": "ร่มเย็น",
            "postalCode": "56110"
          },
          {
            "name": "เชียงบาน",
            "postalCode": "56110"
          },
          {
            "name": "แม่ลาว",
            "postalCode": "56110"
          },
          {
            "name": "อ่างทอง",
            "postalCode": "56110"
          },
          {
            "name": "ทุ่งผาสุข",
            "postalCode": "56110"
          }
        ]
      },
      {
        "name": "เชียงม่วน",
        "subDistricts": [
          {
            "name": "เชียงม่วน",
            "postalCode": "56160"
          },
          {
            "name": "บ้านมาง",
            "postalCode": "56160"
          },
          {
            "name": "สระ",
            "postalCode": "56160"
          }
        ]
      },
      {
        "name": "ดอกคำใต้",
        "subDistricts": [
          {
            "name": "ดอกคำใต้",
            "postalCode": "56120"
          },
          {
            "name": "ดอนศรีชุม",
            "postalCode": "56120"
          },
          {
            "name": "บ้านถ้ำ",
            "postalCode": "56120"
          },
          {
            "name": "บ้านปิน",
            "postalCode": "56120"
          },
          {
            "name": "ห้วยลาน",
            "postalCode": "56120"
          },
          {
            "name": "สันโค้ง",
            "postalCode": "56120"
          },
          {
            "name": "ป่าซาง",
            "postalCode": "56120"
          },
          {
            "name": "หนองหล่ม",
            "postalCode": "56120"
          },
          {
            "name": "ดงสุวรรณ",
            "postalCode": "56120"
          },
          {
            "name": "บุญเกิด",
            "postalCode": "56120"
          },
          {
            "name": "สว่างอารมณ์",
            "postalCode": "56120"
          },
          {
            "name": "คือเวียง",
            "postalCode": "56120"
          }
        ]
      },
      {
        "name": "ปง",
        "subDistricts": [
          {
            "name": "ปง",
            "postalCode": "56140"
          },
          {
            "name": "ควร",
            "postalCode": "56140"
          },
          {
            "name": "ออย",
            "postalCode": "56140"
          },
          {
            "name": "งิม",
            "postalCode": "56140"
          },
          {
            "name": "ผาช้างน้อย",
            "postalCode": "56140"
          },
          {
            "name": "นาปรัง",
            "postalCode": "56140"
          },
          {
            "name": "ขุนควร",
            "postalCode": "56140"
          }
        ]
      },
      {
        "name": "แม่ใจ",
        "subDistricts": [
          {
            "name": "แม่ใจ",
            "postalCode": "56130"
          },
          {
            "name": "ศรีถ้อย",
            "postalCode": "56130"
          },
          {
            "name": "แม่สุก",
            "postalCode": "56130"
          },
          {
            "name": "ป่าแฝก",
            "postalCode": "56130"
          },
          {
            "name": "บ้านเหล่า",
            "postalCode": "56130"
          },
          {
            "name": "เจริญราษฎร์",
            "postalCode": "56130"
          }
        ]
      },
      {
        "name": "ภูซาง",
        "subDistricts": [
          {
            "name": "ภูซาง",
            "postalCode": "56110"
          },
          {
            "name": "ป่าสัก",
            "postalCode": "56110"
          },
          {
            "name": "ทุ่งกล้วย",
            "postalCode": "56110"
          },
          {
            "name": "เชียงแรง",
            "postalCode": "56110"
          },
          {
            "name": "สบบง",
            "postalCode": "56110"
          }
        ]
      },
      {
        "name": "ภูกามยาว",
        "subDistricts": [
          {
            "name": "ห้วยแก้ว",
            "postalCode": "56000"
          },
          {
            "name": "ดงเจน",
            "postalCode": "56000"
          },
          {
            "name": "แม่อิง",
            "postalCode": "56000"
          }
        ]
      }
    ]
  },
  {
    "name": "เชียงราย",
    "districts": [
      {
        "name": "เมืองเชียงราย",
        "subDistricts": [
          {
            "name": "เวียง",
            "postalCode": "57000"
          },
          {
            "name": "รอบเวียง",
            "postalCode": "57000"
          },
          {
            "name": "บ้านดู่",
            "postalCode": "57100"
          },
          {
            "name": "นางแล",
            "postalCode": "57100"
          },
          {
            "name": "แม่ข้าวต้ม",
            "postalCode": "57100"
          },
          {
            "name": "แม่ยาว",
            "postalCode": "57100"
          },
          {
            "name": "สันทราย",
            "postalCode": "57000"
          },
          {
            "name": "แม่กรณ์",
            "postalCode": "57000"
          },
          {
            "name": "ห้วยชมภู",
            "postalCode": "57000"
          },
          {
            "name": "ห้วยสัก",
            "postalCode": "57000"
          },
          {
            "name": "ริมกก",
            "postalCode": "57100"
          },
          {
            "name": "ดอยลาน",
            "postalCode": "57000"
          },
          {
            "name": "ป่าอ้อดอนชัย",
            "postalCode": "57000"
          },
          {
            "name": "ท่าสาย",
            "postalCode": "57000"
          },
          {
            "name": "ดอยฮาง",
            "postalCode": "57000"
          },
          {
            "name": "ท่าสุด",
            "postalCode": "57100"
          }
        ]
      },
      {
        "name": "เวียงชัย",
        "subDistricts": [
          {
            "name": "เวียงชัย",
            "postalCode": "57210"
          },
          {
            "name": "ผางาม",
            "postalCode": "57210"
          },
          {
            "name": "เวียงเหนือ",
            "postalCode": "57210"
          },
          {
            "name": "ดอนศิลา",
            "postalCode": "57210"
          },
          {
            "name": "เมืองชุม",
            "postalCode": "57210"
          }
        ]
      },
      {
        "name": "เชียงของ",
        "subDistricts": [
          {
            "name": "เวียง",
            "postalCode": "57140"
          },
          {
            "name": "สถาน",
            "postalCode": "57140"
          },
          {
            "name": "ครึ่ง",
            "postalCode": "57140"
          },
          {
            "name": "บุญเรือง",
            "postalCode": "57140"
          },
          {
            "name": "ห้วยซ้อ",
            "postalCode": "57140"
          },
          {
            "name": "ศรีดอนชัย",
            "postalCode": "57230"
          },
          {
            "name": "ริมโขง",
            "postalCode": "57140"
          }
        ]
      },
      {
        "name": "เทิง",
        "subDistricts": [
          {
            "name": "เวียง",
            "postalCode": "57160"
          },
          {
            "name": "งิ้ว",
            "postalCode": "57160"
          },
          {
            "name": "ปล้อง",
            "postalCode": "57230"
          },
          {
            "name": "แม่ลอย",
            "postalCode": "57230"
          },
          {
            "name": "เชียงเคี่ยน",
            "postalCode": "57230"
          },
          {
            "name": "ตับเต่า",
            "postalCode": "57160"
          },
          {
            "name": "หงาว",
            "postalCode": "57160"
          },
          {
            "name": "สันทรายงาม",
            "postalCode": "57160"
          },
          {
            "name": "ศรีดอนไชย",
            "postalCode": "57160"
          },
          {
            "name": "หนองแรด",
            "postalCode": "57160"
          }
        ]
      },
      {
        "name": "พาน",
        "subDistricts": [
          {
            "name": "สันมะเค็ด",
            "postalCode": "57120"
          },
          {
            "name": "แม่อ้อ",
            "postalCode": "57120"
          },
          {
            "name": "ธารทอง",
            "postalCode": "57250"
          },
          {
            "name": "สันติสุข",
            "postalCode": "57120"
          },
          {
            "name": "ดอยงาม",
            "postalCode": "57120"
          },
          {
            "name": "หัวง้ม",
            "postalCode": "57120"
          },
          {
            "name": "เจริญเมือง",
            "postalCode": "57120"
          },
          {
            "name": "ป่าหุ่ง",
            "postalCode": "57120"
          },
          {
            "name": "ม่วงคำ",
            "postalCode": "57120"
          },
          {
            "name": "ทรายขาว",
            "postalCode": "57120"
          },
          {
            "name": "สันกลาง",
            "postalCode": "57120"
          },
          {
            "name": "แม่เย็น",
            "postalCode": "57280"
          },
          {
            "name": "เมืองพาน",
            "postalCode": "57120"
          },
          {
            "name": "ทานตะวัน",
            "postalCode": "57280"
          },
          {
            "name": "เวียงห้าว",
            "postalCode": "57120"
          }
        ]
      },
      {
        "name": "ป่าแดด",
        "subDistricts": [
          {
            "name": "ป่าแดด",
            "postalCode": "57190"
          },
          {
            "name": "ป่าแงะ",
            "postalCode": "57190"
          },
          {
            "name": "สันมะค่า",
            "postalCode": "57190"
          },
          {
            "name": "โรงช้าง",
            "postalCode": "57190"
          },
          {
            "name": "ศรีโพธิ์เงิน",
            "postalCode": "57190"
          }
        ]
      },
      {
        "name": "แม่จัน",
        "subDistricts": [
          {
            "name": "แม่จัน",
            "postalCode": "57110"
          },
          {
            "name": "จันจว้า",
            "postalCode": "57270"
          },
          {
            "name": "แม่คำ",
            "postalCode": "57240"
          },
          {
            "name": "ป่าซาง",
            "postalCode": "57110"
          },
          {
            "name": "สันทราย",
            "postalCode": "57110"
          },
          {
            "name": "ท่าข้าวเปลือก",
            "postalCode": "57110"
          },
          {
            "name": "ป่าตึง",
            "postalCode": "57110"
          },
          {
            "name": "แม่ไร่",
            "postalCode": "57240"
          },
          {
            "name": "ศรีค้ำ",
            "postalCode": "57110"
          },
          {
            "name": "จันจว้าใต้",
            "postalCode": "57270"
          },
          {
            "name": "จอมสวรรค์",
            "postalCode": "57110"
          }
        ]
      },
      {
        "name": "เชียงแสน",
        "subDistricts": [
          {
            "name": "เวียง",
            "postalCode": "57150"
          },
          {
            "name": "ป่าสัก",
            "postalCode": "57150"
          },
          {
            "name": "บ้านแซว",
            "postalCode": "57150"
          },
          {
            "name": "ศรีดอนมูล",
            "postalCode": "57150"
          },
          {
            "name": "แม่เงิน",
            "postalCode": "57150"
          },
          {
            "name": "โยนก",
            "postalCode": "57150"
          }
        ]
      },
      {
        "name": "แม่สาย",
        "subDistricts": [
          {
            "name": "แม่สาย",
            "postalCode": "57130"
          },
          {
            "name": "ห้วยไคร้",
            "postalCode": "57220"
          },
          {
            "name": "เกาะช้าง",
            "postalCode": "57130"
          },
          {
            "name": "โป่งผา",
            "postalCode": "57130"
          },
          {
            "name": "ศรีเมืองชุม",
            "postalCode": "57130"
          },
          {
            "name": "เวียงพางคำ",
            "postalCode": "57130"
          },
          {
            "name": "บ้านด้าย",
            "postalCode": "57220"
          },
          {
            "name": "โป่งงาม",
            "postalCode": "57130"
          }
        ]
      },
      {
        "name": "แม่สรวย",
        "subDistricts": [
          {
            "name": "แม่สรวย",
            "postalCode": "57180"
          },
          {
            "name": "ป่าแดด",
            "postalCode": "57180"
          },
          {
            "name": "แม่พริก",
            "postalCode": "57180"
          },
          {
            "name": "ศรีถ้อย",
            "postalCode": "57180"
          },
          {
            "name": "ท่าก๊อ",
            "postalCode": "57180"
          },
          {
            "name": "วาวี",
            "postalCode": "57180"
          },
          {
            "name": "เจดีย์หลวง",
            "postalCode": "57180"
          }
        ]
      },
      {
        "name": "เวียงป่าเป้า",
        "subDistricts": [
          {
            "name": "สันสลี",
            "postalCode": "57170"
          },
          {
            "name": "เวียง",
            "postalCode": "57170"
          },
          {
            "name": "บ้านโป่ง",
            "postalCode": "57170"
          },
          {
            "name": "ป่างิ้ว",
            "postalCode": "57170"
          },
          {
            "name": "เวียงกาหลง",
            "postalCode": "57260"
          },
          {
            "name": "แม่เจดีย์",
            "postalCode": "57260"
          },
          {
            "name": "แม่เจดีย์ใหม่",
            "postalCode": "57260"
          }
        ]
      },
      {
        "name": "พญาเม็งราย",
        "subDistricts": [
          {
            "name": "แม่เปา",
            "postalCode": "57290"
          },
          {
            "name": "แม่ต๋ำ",
            "postalCode": "57290"
          },
          {
            "name": "ไม้ยา",
            "postalCode": "57290"
          },
          {
            "name": "เม็งราย",
            "postalCode": "57290"
          },
          {
            "name": "ตาดควัน",
            "postalCode": "57290"
          }
        ]
      },
      {
        "name": "เวียงแก่น",
        "subDistricts": [
          {
            "name": "ม่วงยาย",
            "postalCode": "57310"
          },
          {
            "name": "ปอ",
            "postalCode": "57310"
          },
          {
            "name": "หล่ายงาว",
            "postalCode": "57310"
          },
          {
            "name": "ท่าข้าม",
            "postalCode": "57310"
          }
        ]
      },
      {
        "name": "ขุนตาล",
        "subDistricts": [
          {
            "name": "ต้า",
            "postalCode": "57340"
          },
          {
            "name": "ป่าตาล",
            "postalCode": "57340"
          },
          {
            "name": "ยางฮอม",
            "postalCode": "57340"
          }
        ]
      },
      {
        "name": "แม่ฟ้าหลวง",
        "subDistricts": [
          {
            "name": "เทอดไทย",
            "postalCode": "57240"
          },
          {
            "name": "แม่สลองใน",
            "postalCode": "57110"
          },
          {
            "name": "แม่สลองนอก",
            "postalCode": "57110"
          },
          {
            "name": "แม่ฟ้าหลวง",
            "postalCode": "57240"
          }
        ]
      },
      {
        "name": "แม่ลาว",
        "subDistricts": [
          {
            "name": "ดงมะดะ",
            "postalCode": "57250"
          },
          {
            "name": "จอมหมอกแก้ว",
            "postalCode": "57250"
          },
          {
            "name": "บัวสลี",
            "postalCode": "57250"
          },
          {
            "name": "ป่าก่อดำ",
            "postalCode": "57250"
          },
          {
            "name": "โป่งแพร่",
            "postalCode": "57000"
          }
        ]
      },
      {
        "name": "เวียงเชียงรุ้ง",
        "subDistricts": [
          {
            "name": "ทุ่งก่อ",
            "postalCode": "57210"
          },
          {
            "name": "ดงมหาวัน",
            "postalCode": "57210"
          },
          {
            "name": "ป่าซาง",
            "postalCode": "57210"
          }
        ]
      },
      {
        "name": "ดอยหลวง",
        "subDistricts": [
          {
            "name": "ปงน้อย",
            "postalCode": "57110"
          },
          {
            "name": "โชคชัย",
            "postalCode": "57110"
          },
          {
            "name": "หนองป่าก่อ",
            "postalCode": "57110"
          }
        ]
      }
    ]
  },
  {
    "name": "แม่ฮ่องสอน",
    "districts": [
      {
        "name": "เมืองแม่ฮ่องสอน",
        "subDistricts": [
          {
            "name": "จองคำ",
            "postalCode": "58000"
          },
          {
            "name": "ห้วยโป่ง",
            "postalCode": "58000"
          },
          {
            "name": "ผาบ่อง",
            "postalCode": "58000"
          },
          {
            "name": "ปางหมู",
            "postalCode": "58000"
          },
          {
            "name": "หมอกจำแป่",
            "postalCode": "58000"
          },
          {
            "name": "ห้วยผา",
            "postalCode": "58000"
          },
          {
            "name": "ห้วยปูลิง",
            "postalCode": "58000"
          }
        ]
      },
      {
        "name": "ขุนยวม",
        "subDistricts": [
          {
            "name": "ขุนยวม",
            "postalCode": "58140"
          },
          {
            "name": "แม่เงา",
            "postalCode": "58140"
          },
          {
            "name": "เมืองปอน",
            "postalCode": "58140"
          },
          {
            "name": "แม่ยวมน้อย",
            "postalCode": "58140"
          },
          {
            "name": "แม่กิ๊",
            "postalCode": "58140"
          },
          {
            "name": "แม่อูคอ",
            "postalCode": "58140"
          }
        ]
      },
      {
        "name": "ปาย",
        "subDistricts": [
          {
            "name": "เวียงใต้",
            "postalCode": "58130"
          },
          {
            "name": "เวียงเหนือ",
            "postalCode": "58130"
          },
          {
            "name": "แม่นาเติง",
            "postalCode": "58130"
          },
          {
            "name": "แม่ฮี้",
            "postalCode": "58130"
          },
          {
            "name": "ทุ่งยาว",
            "postalCode": "58130"
          },
          {
            "name": "เมืองแปง",
            "postalCode": "58130"
          },
          {
            "name": "โป่งสา",
            "postalCode": "58130"
          }
        ]
      },
      {
        "name": "แม่สะเรียง",
        "subDistricts": [
          {
            "name": "บ้านกาศ",
            "postalCode": "58110"
          },
          {
            "name": "แม่สะเรียง",
            "postalCode": "58110"
          },
          {
            "name": "แม่คง",
            "postalCode": "58110"
          },
          {
            "name": "แม่เหาะ",
            "postalCode": "58110"
          },
          {
            "name": "แม่ยวม",
            "postalCode": "58110"
          },
          {
            "name": "เสาหิน",
            "postalCode": "58110"
          },
          {
            "name": "ป่าแป๋",
            "postalCode": "58110"
          }
        ]
      },
      {
        "name": "แม่ลาน้อย",
        "subDistricts": [
          {
            "name": "แม่ลาน้อย",
            "postalCode": "58120"
          },
          {
            "name": "แม่ลาหลวง",
            "postalCode": "58120"
          },
          {
            "name": "ท่าผาปุ้ม",
            "postalCode": "58120"
          },
          {
            "name": "แม่โถ",
            "postalCode": "58120"
          },
          {
            "name": "ห้วยห้อม",
            "postalCode": "58120"
          },
          {
            "name": "แม่นาจาง",
            "postalCode": "58120"
          },
          {
            "name": "สันติคีรี",
            "postalCode": "58120"
          },
          {
            "name": "ขุนแม่ลาน้อย",
            "postalCode": "58120"
          }
        ]
      },
      {
        "name": "สบเมย",
        "subDistricts": [
          {
            "name": "สบเมย",
            "postalCode": "58110"
          },
          {
            "name": "แม่คะตวน",
            "postalCode": "58110"
          },
          {
            "name": "กองก๋อย",
            "postalCode": "58110"
          },
          {
            "name": "แม่สวด",
            "postalCode": "58110"
          },
          {
            "name": "ป่าโปง",
            "postalCode": "58110"
          },
          {
            "name": "แม่สามแลบ",
            "postalCode": "58110"
          }
        ]
      },
      {
        "name": "ปางมะผ้า",
        "subDistricts": [
          {
            "name": "สบป่อง",
            "postalCode": "58150"
          },
          {
            "name": "ปางมะผ้า",
            "postalCode": "58150"
          },
          {
            "name": "ถ้ำลอด",
            "postalCode": "58150"
          },
          {
            "name": "นาปู่ป้อม",
            "postalCode": "58150"
          }
        ]
      }
    ]
  },
  {
    "name": "นครสวรรค์",
    "districts": [
      {
        "name": "เมืองนครสวรรค์",
        "subDistricts": [
          {
            "name": "ปากน้ำโพ",
            "postalCode": "60000"
          },
          {
            "name": "กลางแดด",
            "postalCode": "60000"
          },
          {
            "name": "เกรียงไกร",
            "postalCode": "60000"
          },
          {
            "name": "แควใหญ่",
            "postalCode": "60000"
          },
          {
            "name": "ตะเคียนเลื่อน",
            "postalCode": "60000"
          },
          {
            "name": "นครสวรรค์ตก",
            "postalCode": "60000"
          },
          {
            "name": "นครสวรรค์ออก",
            "postalCode": "60000"
          },
          {
            "name": "บางพระหลวง",
            "postalCode": "60000"
          },
          {
            "name": "บางม่วง",
            "postalCode": "60000"
          },
          {
            "name": "บ้านมะเกลือ",
            "postalCode": "60000"
          },
          {
            "name": "บ้านแก่ง",
            "postalCode": "60000"
          },
          {
            "name": "พระนอน",
            "postalCode": "60000"
          },
          {
            "name": "วัดไทร",
            "postalCode": "60000"
          },
          {
            "name": "หนองกรด",
            "postalCode": "60240"
          },
          {
            "name": "หนองกระโดน",
            "postalCode": "60240"
          },
          {
            "name": "หนองปลิง",
            "postalCode": "60000"
          },
          {
            "name": "บึงเสนาท",
            "postalCode": "60000"
          }
        ]
      },
      {
        "name": "โกรกพระ",
        "subDistricts": [
          {
            "name": "โกรกพระ",
            "postalCode": "60170"
          },
          {
            "name": "ยางตาล",
            "postalCode": "60170"
          },
          {
            "name": "บางมะฝ่อ",
            "postalCode": "60170"
          },
          {
            "name": "บางประมุง",
            "postalCode": "60170"
          },
          {
            "name": "นากลาง",
            "postalCode": "60170"
          },
          {
            "name": "ศาลาแดง",
            "postalCode": "60170"
          },
          {
            "name": "เนินกว้าว",
            "postalCode": "60170"
          },
          {
            "name": "เนินศาลา",
            "postalCode": "60170"
          },
          {
            "name": "หาดสูง",
            "postalCode": "60170"
          }
        ]
      },
      {
        "name": "ชุมแสง",
        "subDistricts": [
          {
            "name": "ชุมแสง",
            "postalCode": "60120"
          },
          {
            "name": "ทับกฤช",
            "postalCode": "60250"
          },
          {
            "name": "พิกุล",
            "postalCode": "60120"
          },
          {
            "name": "เกยไชย",
            "postalCode": "60120"
          },
          {
            "name": "ท่าไม้",
            "postalCode": "60120"
          },
          {
            "name": "บางเคียน",
            "postalCode": "60120"
          },
          {
            "name": "หนองกระเจา",
            "postalCode": "60120"
          },
          {
            "name": "พันลาน",
            "postalCode": "60250"
          },
          {
            "name": "โคกหม้อ",
            "postalCode": "60120"
          },
          {
            "name": "ไผ่สิงห์",
            "postalCode": "60120"
          },
          {
            "name": "ฆะมัง",
            "postalCode": "60120"
          },
          {
            "name": "ทับกฤชใต้",
            "postalCode": "60250"
          }
        ]
      },
      {
        "name": "หนองบัว",
        "subDistricts": [
          {
            "name": "หนองบัว",
            "postalCode": "60110"
          },
          {
            "name": "หนองกลับ",
            "postalCode": "60110"
          },
          {
            "name": "ธารทหาร",
            "postalCode": "60110"
          },
          {
            "name": "ห้วยร่วม",
            "postalCode": "60110"
          },
          {
            "name": "ห้วยถั่วใต้",
            "postalCode": "60110"
          },
          {
            "name": "ห้วยถั่วเหนือ",
            "postalCode": "60110"
          },
          {
            "name": "ห้วยใหญ่",
            "postalCode": "60110"
          },
          {
            "name": "ทุ่งทอง",
            "postalCode": "60110"
          },
          {
            "name": "วังบ่อ",
            "postalCode": "60110"
          }
        ]
      },
      {
        "name": "บรรพตพิสัย",
        "subDistricts": [
          {
            "name": "ท่างิ้ว",
            "postalCode": "60180"
          },
          {
            "name": "บางตาหงาย",
            "postalCode": "60180"
          },
          {
            "name": "หูกวาง",
            "postalCode": "60180"
          },
          {
            "name": "อ่างทอง",
            "postalCode": "60180"
          },
          {
            "name": "บ้านแดน",
            "postalCode": "60180"
          },
          {
            "name": "บางแก้ว",
            "postalCode": "60180"
          },
          {
            "name": "ตาขีด",
            "postalCode": "60180"
          },
          {
            "name": "ตาสัง",
            "postalCode": "60180"
          },
          {
            "name": "ด่านช้าง",
            "postalCode": "60180"
          },
          {
            "name": "หนองกรด",
            "postalCode": "60180"
          },
          {
            "name": "หนองตางู",
            "postalCode": "60180"
          },
          {
            "name": "บึงปลาทู",
            "postalCode": "60180"
          },
          {
            "name": "เจริญผล",
            "postalCode": "60180"
          }
        ]
      },
      {
        "name": "เก้าเลี้ยว",
        "subDistricts": [
          {
            "name": "มหาโพธิ",
            "postalCode": "60230"
          },
          {
            "name": "เก้าเลี้ยว",
            "postalCode": "60230"
          },
          {
            "name": "หนองเต่า",
            "postalCode": "60230"
          },
          {
            "name": "เขาดิน",
            "postalCode": "60230"
          },
          {
            "name": "หัวดง",
            "postalCode": "60230"
          }
        ]
      },
      {
        "name": "ตาคลี",
        "subDistricts": [
          {
            "name": "ตาคลี",
            "postalCode": "60140"
          },
          {
            "name": "ช่องแค",
            "postalCode": "60210"
          },
          {
            "name": "จันเสน",
            "postalCode": "60260"
          },
          {
            "name": "ห้วยหอม",
            "postalCode": "60210"
          },
          {
            "name": "หัวหวาย",
            "postalCode": "60140"
          },
          {
            "name": "หนองโพ",
            "postalCode": "60140"
          },
          {
            "name": "หนองหม้อ",
            "postalCode": "60140"
          },
          {
            "name": "สร้อยทอง",
            "postalCode": "60210"
          },
          {
            "name": "ลาดทิพรส",
            "postalCode": "60260"
          },
          {
            "name": "พรหมนิมิต",
            "postalCode": "60210"
          }
        ]
      },
      {
        "name": "ท่าตะโก",
        "subDistricts": [
          {
            "name": "ท่าตะโก",
            "postalCode": "60160"
          },
          {
            "name": "พนมรอก",
            "postalCode": "60160"
          },
          {
            "name": "หัวถนน",
            "postalCode": "60160"
          },
          {
            "name": "สายลำโพง",
            "postalCode": "60160"
          },
          {
            "name": "วังมหากร",
            "postalCode": "60160"
          },
          {
            "name": "ดอนคา",
            "postalCode": "60160"
          },
          {
            "name": "ทำนบ",
            "postalCode": "60160"
          },
          {
            "name": "วังใหญ่",
            "postalCode": "60160"
          },
          {
            "name": "พนมเศษ",
            "postalCode": "60160"
          },
          {
            "name": "หนองหลวง",
            "postalCode": "60160"
          }
        ]
      },
      {
        "name": "ไพศาลี",
        "subDistricts": [
          {
            "name": "โคกเดื่อ",
            "postalCode": "60220"
          },
          {
            "name": "สำโรงชัย",
            "postalCode": "60220"
          },
          {
            "name": "วังน้ำลัด",
            "postalCode": "60220"
          },
          {
            "name": "ตะคร้อ",
            "postalCode": "60220"
          },
          {
            "name": "โพธิ์ประสาท",
            "postalCode": "60220"
          },
          {
            "name": "วังข่อย",
            "postalCode": "60220"
          },
          {
            "name": "นาขอม",
            "postalCode": "60220"
          },
          {
            "name": "ไพศาลี",
            "postalCode": "60220"
          }
        ]
      },
      {
        "name": "พยุหะคีรี",
        "subDistricts": [
          {
            "name": "พยุหะ",
            "postalCode": "60130"
          },
          {
            "name": "เนินมะกอก",
            "postalCode": "60130"
          },
          {
            "name": "นิคมเขาบ่อแก้ว",
            "postalCode": "60130"
          },
          {
            "name": "ม่วงหัก",
            "postalCode": "60130"
          },
          {
            "name": "ยางขาว",
            "postalCode": "60130"
          },
          {
            "name": "ย่านมัทรี",
            "postalCode": "60130"
          },
          {
            "name": "เขาทอง",
            "postalCode": "60130"
          },
          {
            "name": "ท่าน้ำอ้อย",
            "postalCode": "60130"
          },
          {
            "name": "น้ำทรง",
            "postalCode": "60130"
          },
          {
            "name": "เขากะลา",
            "postalCode": "60130"
          },
          {
            "name": "สระทะเล",
            "postalCode": "60130"
          }
        ]
      },
      {
        "name": "ลาดยาว",
        "subDistricts": [
          {
            "name": "ลาดยาว",
            "postalCode": "60150"
          },
          {
            "name": "ห้วยน้ำหอม",
            "postalCode": "60150"
          },
          {
            "name": "วังม้า",
            "postalCode": "60150"
          },
          {
            "name": "วังเมือง",
            "postalCode": "60150"
          },
          {
            "name": "สร้อยละคร",
            "postalCode": "60150"
          },
          {
            "name": "มาบแก",
            "postalCode": "60150"
          },
          {
            "name": "หนองยาว",
            "postalCode": "60150"
          },
          {
            "name": "หนองนมวัว",
            "postalCode": "60150"
          },
          {
            "name": "บ้านไร่",
            "postalCode": "60150"
          },
          {
            "name": "เนินขี้เหล็ก",
            "postalCode": "60150"
          },
          {
            "name": "ศาลเจ้าไก่ต่อ",
            "postalCode": "60150"
          },
          {
            "name": "สระแก้ว",
            "postalCode": "60150"
          }
        ]
      },
      {
        "name": "ตากฟ้า",
        "subDistricts": [
          {
            "name": "ตากฟ้า",
            "postalCode": "60190"
          },
          {
            "name": "ลำพยนต์",
            "postalCode": "60190"
          },
          {
            "name": "สุขสำราญ",
            "postalCode": "60190"
          },
          {
            "name": "หนองพิกุล",
            "postalCode": "60190"
          },
          {
            "name": "พุนกยูง",
            "postalCode": "60190"
          },
          {
            "name": "อุดมธัญญา",
            "postalCode": "60190"
          },
          {
            "name": "เขาชายธง",
            "postalCode": "60190"
          }
        ]
      },
      {
        "name": "แม่วงก์",
        "subDistricts": [
          {
            "name": "แม่วงก์",
            "postalCode": "60150"
          },
          {
            "name": "แม่เล่ย์",
            "postalCode": "60150"
          },
          {
            "name": "วังซ่าน",
            "postalCode": "60150"
          },
          {
            "name": "เขาชนกัน",
            "postalCode": "60150"
          }
        ]
      },
      {
        "name": "แม่เปิน",
        "subDistricts": [
          {
            "name": "แม่เปิน",
            "postalCode": "60150"
          }
        ]
      },
      {
        "name": "ชุมตาบง",
        "subDistricts": [
          {
            "name": "ชุมตาบง",
            "postalCode": "60150"
          },
          {
            "name": "ปางสวรรค์",
            "postalCode": "60150"
          }
        ]
      }
    ]
  },
  {
    "name": "อุทัยธานี",
    "districts": [
      {
        "name": "เมืองอุทัยธานี",
        "subDistricts": [
          {
            "name": "อุทัยใหม่",
            "postalCode": "61000"
          },
          {
            "name": "น้ำซึม",
            "postalCode": "61000"
          },
          {
            "name": "สะแกกรัง",
            "postalCode": "61000"
          },
          {
            "name": "ดอนขวาง",
            "postalCode": "61000"
          },
          {
            "name": "หาดทนง",
            "postalCode": "61000"
          },
          {
            "name": "เกาะเทโพ",
            "postalCode": "61000"
          },
          {
            "name": "ท่าซุง",
            "postalCode": "61000"
          },
          {
            "name": "หนองแก",
            "postalCode": "61000"
          },
          {
            "name": "โนนเหล็ก",
            "postalCode": "61000"
          },
          {
            "name": "หนองเต่า",
            "postalCode": "61000"
          },
          {
            "name": "หนองไผ่แบน",
            "postalCode": "61000"
          },
          {
            "name": "หนองพังค่า",
            "postalCode": "61000"
          },
          {
            "name": "ทุ่งใหญ่",
            "postalCode": "61000"
          },
          {
            "name": "เนินแจง",
            "postalCode": "61000"
          }
        ]
      },
      {
        "name": "ทัพทัน",
        "subDistricts": [
          {
            "name": "ทัพทัน",
            "postalCode": "61120"
          },
          {
            "name": "ทุ่งนาไทย",
            "postalCode": "61120"
          },
          {
            "name": "เขาขี้ฝอย",
            "postalCode": "61120"
          },
          {
            "name": "หนองหญ้าปล้อง",
            "postalCode": "61120"
          },
          {
            "name": "โคกหม้อ",
            "postalCode": "61120"
          },
          {
            "name": "หนองยายดา",
            "postalCode": "61120"
          },
          {
            "name": "หนองกลางดง",
            "postalCode": "61120"
          },
          {
            "name": "หนองกระทุ่ม",
            "postalCode": "61120"
          },
          {
            "name": "หนองสระ",
            "postalCode": "61120"
          },
          {
            "name": "ตลุกดู่",
            "postalCode": "61120"
          }
        ]
      },
      {
        "name": "สว่างอารมณ์",
        "subDistricts": [
          {
            "name": "สว่างอารมณ์",
            "postalCode": "61150"
          },
          {
            "name": "หนองหลวง",
            "postalCode": "61150"
          },
          {
            "name": "พลวงสองนาง",
            "postalCode": "61150"
          },
          {
            "name": "ไผ่เขียว",
            "postalCode": "61150"
          },
          {
            "name": "บ่อยาง",
            "postalCode": "61150"
          }
        ]
      },
      {
        "name": "หนองฉาง",
        "subDistricts": [
          {
            "name": "หนองฉาง",
            "postalCode": "61110"
          },
          {
            "name": "หนองยาง",
            "postalCode": "61110"
          },
          {
            "name": "หนองนางนวล",
            "postalCode": "61110"
          },
          {
            "name": "หนองสรวง",
            "postalCode": "61110"
          },
          {
            "name": "บ้านเก่า",
            "postalCode": "61110"
          },
          {
            "name": "อุทัยเก่า",
            "postalCode": "61110"
          },
          {
            "name": "ทุ่งโพ",
            "postalCode": "61110"
          },
          {
            "name": "ทุ่งพง",
            "postalCode": "61110"
          },
          {
            "name": "เขาบางแกรก",
            "postalCode": "61170"
          },
          {
            "name": "เขากวางทอง",
            "postalCode": "61110"
          }
        ]
      },
      {
        "name": "หนองขาหย่าง",
        "subDistricts": [
          {
            "name": "หนองขาหย่าง",
            "postalCode": "61130"
          },
          {
            "name": "หนองไผ่",
            "postalCode": "61130"
          },
          {
            "name": "ดอนกลอย",
            "postalCode": "61130"
          },
          {
            "name": "ห้วยรอบ",
            "postalCode": "61130"
          },
          {
            "name": "ทุ่งพึ่ง",
            "postalCode": "61130"
          },
          {
            "name": "ท่าโพ",
            "postalCode": "61130"
          },
          {
            "name": "หมกแถว",
            "postalCode": "61130"
          },
          {
            "name": "หลุมเข้า",
            "postalCode": "61130"
          },
          {
            "name": "ดงขวาง",
            "postalCode": "61130"
          }
        ]
      },
      {
        "name": "บ้านไร่",
        "subDistricts": [
          {
            "name": "บ้านไร่",
            "postalCode": "61140"
          },
          {
            "name": "ทัพหลวง",
            "postalCode": "61140"
          },
          {
            "name": "ห้วยแห้ง",
            "postalCode": "61140"
          },
          {
            "name": "คอกควาย",
            "postalCode": "61140"
          },
          {
            "name": "วังหิน",
            "postalCode": "61180"
          },
          {
            "name": "เมืองการุ้ง",
            "postalCode": "61180"
          },
          {
            "name": "แก่นมะกรูด",
            "postalCode": "61140"
          },
          {
            "name": "หนองจอก",
            "postalCode": "61180"
          },
          {
            "name": "หูช้าง",
            "postalCode": "61180"
          },
          {
            "name": "บ้านบึง",
            "postalCode": "61140"
          },
          {
            "name": "บ้านใหม่คลองเคียน",
            "postalCode": "61180"
          },
          {
            "name": "หนองบ่มกล้วย",
            "postalCode": "61180"
          },
          {
            "name": "เจ้าวัด",
            "postalCode": "61140"
          }
        ]
      },
      {
        "name": "ลานสัก",
        "subDistricts": [
          {
            "name": "ลานสัก",
            "postalCode": "61160"
          },
          {
            "name": "ประดู่ยืน",
            "postalCode": "61160"
          },
          {
            "name": "ป่าอ้อ",
            "postalCode": "61160"
          },
          {
            "name": "ระบำ",
            "postalCode": "61160"
          },
          {
            "name": "น้ำรอบ",
            "postalCode": "61160"
          },
          {
            "name": "ทุ่งนางาม",
            "postalCode": "61160"
          }
        ]
      },
      {
        "name": "ห้วยคต",
        "subDistricts": [
          {
            "name": "สุขฤทัย",
            "postalCode": "61170"
          },
          {
            "name": "ทองหลาง",
            "postalCode": "61170"
          },
          {
            "name": "ห้วยคต",
            "postalCode": "61170"
          }
        ]
      }
    ]
  },
  {
    "name": "กำแพงเพชร",
    "districts": [
      {
        "name": "เมืองกำแพงเพชร",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "62000"
          },
          {
            "name": "ไตรตรึงษ์",
            "postalCode": "62160"
          },
          {
            "name": "อ่างทอง",
            "postalCode": "62000"
          },
          {
            "name": "นาบ่อคำ",
            "postalCode": "62000"
          },
          {
            "name": "นครชุม",
            "postalCode": "62000"
          },
          {
            "name": "ทรงธรรม",
            "postalCode": "62000"
          },
          {
            "name": "ลานดอกไม้",
            "postalCode": "62000"
          },
          {
            "name": "หนองปลิง",
            "postalCode": "62000"
          },
          {
            "name": "คณฑี",
            "postalCode": "62000"
          },
          {
            "name": "นิคมทุ่งโพธิ์ทะเล",
            "postalCode": "62000"
          },
          {
            "name": "เทพนคร",
            "postalCode": "62000"
          },
          {
            "name": "วังทอง",
            "postalCode": "62000"
          },
          {
            "name": "ท่าขุนราม",
            "postalCode": "62000"
          },
          {
            "name": "คลองแม่ลาย",
            "postalCode": "62000"
          },
          {
            "name": "ธำมรงค์",
            "postalCode": "62160"
          },
          {
            "name": "สระแก้ว",
            "postalCode": "62000"
          }
        ]
      },
      {
        "name": "ไทรงาม",
        "subDistricts": [
          {
            "name": "ไทรงาม",
            "postalCode": "62150"
          },
          {
            "name": "หนองคล้า",
            "postalCode": "62150"
          },
          {
            "name": "หนองทอง",
            "postalCode": "62150"
          },
          {
            "name": "หนองไม้กอง",
            "postalCode": "62150"
          },
          {
            "name": "มหาชัย",
            "postalCode": "62150"
          },
          {
            "name": "พานทอง",
            "postalCode": "62150"
          },
          {
            "name": "หนองแม่แตง",
            "postalCode": "62150"
          }
        ]
      },
      {
        "name": "คลองลาน",
        "subDistricts": [
          {
            "name": "คลองน้ำไหล",
            "postalCode": "62180"
          },
          {
            "name": "โป่งน้ำร้อน",
            "postalCode": "62180"
          },
          {
            "name": "คลองลานพัฒนา",
            "postalCode": "62180"
          },
          {
            "name": "สักงาม",
            "postalCode": "62180"
          }
        ]
      },
      {
        "name": "ขาณุวรลักษบุรี",
        "subDistricts": [
          {
            "name": "ยางสูง",
            "postalCode": "62130"
          },
          {
            "name": "ป่าพุทรา",
            "postalCode": "62130"
          },
          {
            "name": "แสนตอ",
            "postalCode": "62130"
          },
          {
            "name": "สลกบาตร",
            "postalCode": "62140"
          },
          {
            "name": "บ่อถ้ำ",
            "postalCode": "62140"
          },
          {
            "name": "ดอนแตง",
            "postalCode": "62140"
          },
          {
            "name": "วังชะพลู",
            "postalCode": "62140"
          },
          {
            "name": "โค้งไผ่",
            "postalCode": "62140"
          },
          {
            "name": "ปางมะค่า",
            "postalCode": "62140"
          },
          {
            "name": "วังหามแห",
            "postalCode": "62140"
          },
          {
            "name": "เกาะตาล",
            "postalCode": "62130"
          }
        ]
      },
      {
        "name": "คลองขลุง",
        "subDistricts": [
          {
            "name": "คลองขลุง",
            "postalCode": "62120"
          },
          {
            "name": "ท่ามะเขือ",
            "postalCode": "62120"
          },
          {
            "name": "ท่าพุทรา",
            "postalCode": "62120"
          },
          {
            "name": "แม่ลาด",
            "postalCode": "62120"
          },
          {
            "name": "วังยาง",
            "postalCode": "62120"
          },
          {
            "name": "วังแขม",
            "postalCode": "62120"
          },
          {
            "name": "หัวถนน",
            "postalCode": "62120"
          },
          {
            "name": "วังไทร",
            "postalCode": "62120"
          },
          {
            "name": "วังบัว",
            "postalCode": "62120"
          },
          {
            "name": "คลองสมบูรณ์",
            "postalCode": "62120"
          }
        ]
      },
      {
        "name": "พรานกระต่าย",
        "subDistricts": [
          {
            "name": "พรานกระต่าย",
            "postalCode": "62110"
          },
          {
            "name": "หนองหัววัว",
            "postalCode": "62110"
          },
          {
            "name": "ท่าไม้",
            "postalCode": "62110"
          },
          {
            "name": "วังควง",
            "postalCode": "62110"
          },
          {
            "name": "วังตะแบก",
            "postalCode": "62110"
          },
          {
            "name": "เขาคีริส",
            "postalCode": "62110"
          },
          {
            "name": "คุยบ้านโอง",
            "postalCode": "62110"
          },
          {
            "name": "คลองพิไกร",
            "postalCode": "62110"
          },
          {
            "name": "ถ้ำกระต่ายทอง",
            "postalCode": "62110"
          },
          {
            "name": "ห้วยยั้ง",
            "postalCode": "62110"
          }
        ]
      },
      {
        "name": "ลานกระบือ",
        "subDistricts": [
          {
            "name": "ลานกระบือ",
            "postalCode": "62170"
          },
          {
            "name": "ช่องลม",
            "postalCode": "62170"
          },
          {
            "name": "หนองหลวง",
            "postalCode": "62170"
          },
          {
            "name": "โนนพลวง",
            "postalCode": "62170"
          },
          {
            "name": "ประชาสุขสันต์",
            "postalCode": "62170"
          },
          {
            "name": "บึงทับแรต",
            "postalCode": "62170"
          },
          {
            "name": "จันทิมา",
            "postalCode": "62170"
          }
        ]
      },
      {
        "name": "ทรายทองวัฒนา",
        "subDistricts": [
          {
            "name": "ทุ่งทราย",
            "postalCode": "62190"
          },
          {
            "name": "ทุ่งทอง",
            "postalCode": "62190"
          },
          {
            "name": "ถาวรวัฒนา",
            "postalCode": "62190"
          }
        ]
      },
      {
        "name": "ปางศิลาทอง",
        "subDistricts": [
          {
            "name": "โพธิ์ทอง",
            "postalCode": "62120"
          },
          {
            "name": "หินดาต",
            "postalCode": "62120"
          },
          {
            "name": "ปางตาไว",
            "postalCode": "62120"
          }
        ]
      },
      {
        "name": "บึงสามัคคี",
        "subDistricts": [
          {
            "name": "บึงสามัคคี",
            "postalCode": "62210"
          },
          {
            "name": "วังชะโอน",
            "postalCode": "62210"
          },
          {
            "name": "ระหาน",
            "postalCode": "62210"
          },
          {
            "name": "เทพนิมิต",
            "postalCode": "62210"
          }
        ]
      },
      {
        "name": "โกสัมพีนคร",
        "subDistricts": [
          {
            "name": "โกสัมพี",
            "postalCode": "62000"
          },
          {
            "name": "เพชรชมภู",
            "postalCode": "62000"
          },
          {
            "name": "ลานดอกไม้ตก",
            "postalCode": "62000"
          }
        ]
      }
    ]
  },
  {
    "name": "ตาก",
    "districts": [
      {
        "name": "เมืองตาก",
        "subDistricts": [
          {
            "name": "ระแหง",
            "postalCode": "63000"
          },
          {
            "name": "หนองหลวง",
            "postalCode": "63000"
          },
          {
            "name": "เชียงเงิน",
            "postalCode": "63000"
          },
          {
            "name": "หัวเดียด",
            "postalCode": "63000"
          },
          {
            "name": "หนองบัวเหนือ",
            "postalCode": "63000"
          },
          {
            "name": "ไม้งาม",
            "postalCode": "63000"
          },
          {
            "name": "โป่งแดง",
            "postalCode": "63000"
          },
          {
            "name": "น้ำรึม",
            "postalCode": "63000"
          },
          {
            "name": "วังหิน",
            "postalCode": "63000"
          },
          {
            "name": "แม่ท้อ",
            "postalCode": "63000"
          },
          {
            "name": "ป่ามะม่วง",
            "postalCode": "63000"
          },
          {
            "name": "หนองบัวใต้",
            "postalCode": "63000"
          },
          {
            "name": "วังประจบ",
            "postalCode": "63000"
          },
          {
            "name": "ตลุกกลางทุ่ง",
            "postalCode": "63000"
          }
        ]
      },
      {
        "name": "บ้านตาก",
        "subDistricts": [
          {
            "name": "ตากออก",
            "postalCode": "63120"
          },
          {
            "name": "สมอโคน",
            "postalCode": "63120"
          },
          {
            "name": "แม่สลิด",
            "postalCode": "63120"
          },
          {
            "name": "ตากตก",
            "postalCode": "63120"
          },
          {
            "name": "เกาะตะเภา",
            "postalCode": "63120"
          },
          {
            "name": "ทุ่งกระเชาะ",
            "postalCode": "63120"
          },
          {
            "name": "ท้องฟ้า",
            "postalCode": "63120"
          }
        ]
      },
      {
        "name": "สามเงา",
        "subDistricts": [
          {
            "name": "สามเงา",
            "postalCode": "63130"
          },
          {
            "name": "วังหมัน",
            "postalCode": "63130"
          },
          {
            "name": "ยกกระบัตร",
            "postalCode": "63130"
          },
          {
            "name": "ย่านรี",
            "postalCode": "63130"
          },
          {
            "name": "บ้านนา",
            "postalCode": "63130"
          },
          {
            "name": "วังจันทร์",
            "postalCode": "63130"
          }
        ]
      },
      {
        "name": "แม่ระมาด",
        "subDistricts": [
          {
            "name": "แม่ระมาด",
            "postalCode": "63140"
          },
          {
            "name": "แม่จะเรา",
            "postalCode": "63140"
          },
          {
            "name": "ขะเนจื้อ",
            "postalCode": "63140"
          },
          {
            "name": "แม่ตื่น",
            "postalCode": "63140"
          },
          {
            "name": "สามหมื่น",
            "postalCode": "63140"
          },
          {
            "name": "พระธาตุ",
            "postalCode": "63140"
          }
        ]
      },
      {
        "name": "ท่าสองยาง",
        "subDistricts": [
          {
            "name": "ท่าสองยาง",
            "postalCode": "63150"
          },
          {
            "name": "แม่ต้าน",
            "postalCode": "63150"
          },
          {
            "name": "แม่สอง",
            "postalCode": "63150"
          },
          {
            "name": "แม่หละ",
            "postalCode": "63150"
          },
          {
            "name": "แม่วะหลวง",
            "postalCode": "63150"
          },
          {
            "name": "แม่อุสุ",
            "postalCode": "63150"
          }
        ]
      },
      {
        "name": "แม่สอด",
        "subDistricts": [
          {
            "name": "แม่สอด",
            "postalCode": "63110"
          },
          {
            "name": "แม่กุ",
            "postalCode": "63110"
          },
          {
            "name": "พะวอ",
            "postalCode": "63110"
          },
          {
            "name": "แม่ตาว",
            "postalCode": "63110"
          },
          {
            "name": "แม่กาษา",
            "postalCode": "63110"
          },
          {
            "name": "ท่าสายลวด",
            "postalCode": "63110"
          },
          {
            "name": "แม่ปะ",
            "postalCode": "63110"
          },
          {
            "name": "มหาวัน",
            "postalCode": "63110"
          },
          {
            "name": "ด่านแม่ละเมา",
            "postalCode": "63110"
          },
          {
            "name": "พระธาตุผาแดง",
            "postalCode": "63110"
          }
        ]
      },
      {
        "name": "พบพระ",
        "subDistricts": [
          {
            "name": "พบพระ",
            "postalCode": "63160"
          },
          {
            "name": "ช่องแคบ",
            "postalCode": "63160"
          },
          {
            "name": "คีรีราษฎร์",
            "postalCode": "63160"
          },
          {
            "name": "วาเล่ย์",
            "postalCode": "63160"
          },
          {
            "name": "รวมไทยพัฒนา",
            "postalCode": "63160"
          }
        ]
      },
      {
        "name": "อุ้มผาง",
        "subDistricts": [
          {
            "name": "อุ้มผาง",
            "postalCode": "63170"
          },
          {
            "name": "หนองหลวง",
            "postalCode": "63170"
          },
          {
            "name": "โมโกร",
            "postalCode": "63170"
          },
          {
            "name": "แม่จัน",
            "postalCode": "63170"
          },
          {
            "name": "แม่ละมุ้ง",
            "postalCode": "63170"
          },
          {
            "name": "แม่กลอง",
            "postalCode": "63170"
          }
        ]
      },
      {
        "name": "วังเจ้า",
        "subDistricts": [
          {
            "name": "เชียงทอง",
            "postalCode": "63000"
          },
          {
            "name": "นาโบสถ์",
            "postalCode": "63000"
          },
          {
            "name": "ประดาง",
            "postalCode": "63000"
          }
        ]
      }
    ]
  },
  {
    "name": "สุโขทัย",
    "districts": [
      {
        "name": "เมืองสุโขทัย",
        "subDistricts": [
          {
            "name": "ธานี",
            "postalCode": "64000"
          },
          {
            "name": "บ้านสวน",
            "postalCode": "64220"
          },
          {
            "name": "เมืองเก่า",
            "postalCode": "64210"
          },
          {
            "name": "ปากแคว",
            "postalCode": "64000"
          },
          {
            "name": "ยางซ้าย",
            "postalCode": "64000"
          },
          {
            "name": "บ้านกล้วย",
            "postalCode": "64000"
          },
          {
            "name": "บ้านหลุม",
            "postalCode": "64000"
          },
          {
            "name": "ตาลเตี้ย",
            "postalCode": "64220"
          },
          {
            "name": "ปากพระ",
            "postalCode": "64000"
          },
          {
            "name": "วังทองแดง",
            "postalCode": "64210"
          }
        ]
      },
      {
        "name": "บ้านด่านลานหอย",
        "subDistricts": [
          {
            "name": "ลานหอย",
            "postalCode": "64140"
          },
          {
            "name": "บ้านด่าน",
            "postalCode": "64140"
          },
          {
            "name": "วังตะคร้อ",
            "postalCode": "64140"
          },
          {
            "name": "วังน้ำขาว",
            "postalCode": "64140"
          },
          {
            "name": "ตลิ่งชัน",
            "postalCode": "64140"
          },
          {
            "name": "หนองหญ้าปล้อง",
            "postalCode": "64140"
          },
          {
            "name": "วังลึก",
            "postalCode": "64140"
          }
        ]
      },
      {
        "name": "คีรีมาศ",
        "subDistricts": [
          {
            "name": "โตนด",
            "postalCode": "64160"
          },
          {
            "name": "ทุ่งหลวง",
            "postalCode": "64160"
          },
          {
            "name": "บ้านป้อม",
            "postalCode": "64160"
          },
          {
            "name": "สามพวง",
            "postalCode": "64160"
          },
          {
            "name": "ศรีคีรีมาศ",
            "postalCode": "64160"
          },
          {
            "name": "หนองจิก",
            "postalCode": "64160"
          },
          {
            "name": "นาเชิงคีรี",
            "postalCode": "64160"
          },
          {
            "name": "หนองกระดิ่ง",
            "postalCode": "64160"
          },
          {
            "name": "บ้านน้ำพุ",
            "postalCode": "64160"
          },
          {
            "name": "ทุ่งยางเมือง",
            "postalCode": "64160"
          }
        ]
      },
      {
        "name": "กงไกรลาศ",
        "subDistricts": [
          {
            "name": "กง",
            "postalCode": "64170"
          },
          {
            "name": "บ้านกร่าง",
            "postalCode": "64170"
          },
          {
            "name": "ไกรนอก",
            "postalCode": "64170"
          },
          {
            "name": "ไกรกลาง",
            "postalCode": "64170"
          },
          {
            "name": "ไกรใน",
            "postalCode": "64170"
          },
          {
            "name": "ดงเดือย",
            "postalCode": "64170"
          },
          {
            "name": "ป่าแฝก",
            "postalCode": "64170"
          },
          {
            "name": "กกแรต",
            "postalCode": "64170"
          },
          {
            "name": "ท่าฉนวน",
            "postalCode": "64170"
          },
          {
            "name": "หนองตูม",
            "postalCode": "64170"
          },
          {
            "name": "บ้านใหม่สุขเกษม",
            "postalCode": "64170"
          }
        ]
      },
      {
        "name": "ศรีสัชนาลัย",
        "subDistricts": [
          {
            "name": "หาดเสี้ยว",
            "postalCode": "64130"
          },
          {
            "name": "ป่างิ้ว",
            "postalCode": "64130"
          },
          {
            "name": "แม่สำ",
            "postalCode": "64130"
          },
          {
            "name": "แม่สิน",
            "postalCode": "64130"
          },
          {
            "name": "บ้านตึก",
            "postalCode": "64130"
          },
          {
            "name": "หนองอ้อ",
            "postalCode": "64130"
          },
          {
            "name": "ท่าชัย",
            "postalCode": "64190"
          },
          {
            "name": "ศรีสัชนาลัย",
            "postalCode": "64190"
          },
          {
            "name": "ดงคู่",
            "postalCode": "64130"
          },
          {
            "name": "บ้านแก่ง",
            "postalCode": "64130"
          },
          {
            "name": "สารจิตร",
            "postalCode": "64130"
          }
        ]
      },
      {
        "name": "ศรีสำโรง",
        "subDistricts": [
          {
            "name": "คลองตาล",
            "postalCode": "64120"
          },
          {
            "name": "วังลึก",
            "postalCode": "64120"
          },
          {
            "name": "สามเรือน",
            "postalCode": "64120"
          },
          {
            "name": "บ้านนา",
            "postalCode": "64120"
          },
          {
            "name": "วังทอง",
            "postalCode": "64120"
          },
          {
            "name": "นาขุนไกร",
            "postalCode": "64120"
          },
          {
            "name": "เกาะตาเลี้ยง",
            "postalCode": "64120"
          },
          {
            "name": "วัดเกาะ",
            "postalCode": "64120"
          },
          {
            "name": "บ้านไร่",
            "postalCode": "64120"
          },
          {
            "name": "ทับผึ้ง",
            "postalCode": "64120"
          },
          {
            "name": "บ้านซ่าน",
            "postalCode": "64120"
          },
          {
            "name": "วังใหญ่",
            "postalCode": "64120"
          },
          {
            "name": "ราวต้นจันทร์",
            "postalCode": "64120"
          }
        ]
      },
      {
        "name": "สวรรคโลก",
        "subDistricts": [
          {
            "name": "เมืองสวรรคโลก",
            "postalCode": "64110"
          },
          {
            "name": "ในเมือง",
            "postalCode": "64110"
          },
          {
            "name": "คลองกระจง",
            "postalCode": "64110"
          },
          {
            "name": "วังพิณพาทย์",
            "postalCode": "64110"
          },
          {
            "name": "วังไม้ขอน",
            "postalCode": "64110"
          },
          {
            "name": "ย่านยาว",
            "postalCode": "64110"
          },
          {
            "name": "นาทุ่ง",
            "postalCode": "64110"
          },
          {
            "name": "คลองยาง",
            "postalCode": "64110"
          },
          {
            "name": "เมืองบางยม",
            "postalCode": "64110"
          },
          {
            "name": "ท่าทอง",
            "postalCode": "64110"
          },
          {
            "name": "ปากน้ำ",
            "postalCode": "64110"
          },
          {
            "name": "ป่ากุมเกาะ",
            "postalCode": "64110"
          },
          {
            "name": "เมืองบางขลัง",
            "postalCode": "64110"
          },
          {
            "name": "หนองกลับ",
            "postalCode": "64110"
          }
        ]
      },
      {
        "name": "ศรีนคร",
        "subDistricts": [
          {
            "name": "ศรีนคร",
            "postalCode": "64180"
          },
          {
            "name": "นครเดิฐ",
            "postalCode": "64180"
          },
          {
            "name": "น้ำขุม",
            "postalCode": "64180"
          },
          {
            "name": "คลองมะพลับ",
            "postalCode": "64180"
          },
          {
            "name": "หนองบัว",
            "postalCode": "64180"
          }
        ]
      },
      {
        "name": "ทุ่งเสลี่ยม",
        "subDistricts": [
          {
            "name": "บ้านใหม่ไชยมงคล",
            "postalCode": "64230"
          },
          {
            "name": "ไทยชนะศึก",
            "postalCode": "64150"
          },
          {
            "name": "ทุ่งเสลี่ยม",
            "postalCode": "64150"
          },
          {
            "name": "กลางดง",
            "postalCode": "64150"
          },
          {
            "name": "เขาแก้วศรีสมบูรณ์",
            "postalCode": "64230"
          }
        ]
      }
    ]
  },
  {
    "name": "พิษณุโลก",
    "districts": [
      {
        "name": "เมืองพิษณุโลก",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "65000"
          },
          {
            "name": "วังน้ำคู้",
            "postalCode": "65230"
          },
          {
            "name": "วัดจันทร์",
            "postalCode": "65000"
          },
          {
            "name": "วัดพริก",
            "postalCode": "65230"
          },
          {
            "name": "ท่าทอง",
            "postalCode": "65000"
          },
          {
            "name": "ท่าโพธิ์",
            "postalCode": "65000"
          },
          {
            "name": "สมอแข",
            "postalCode": "65000"
          },
          {
            "name": "ดอนทอง",
            "postalCode": "65000"
          },
          {
            "name": "บ้านป่า",
            "postalCode": "65000"
          },
          {
            "name": "ปากโทก",
            "postalCode": "65000"
          },
          {
            "name": "หัวรอ",
            "postalCode": "65000"
          },
          {
            "name": "จอมทอง",
            "postalCode": "65000"
          },
          {
            "name": "บ้านกร่าง",
            "postalCode": "65000"
          },
          {
            "name": "บ้านคลอง",
            "postalCode": "65000"
          },
          {
            "name": "พลายชุมพล",
            "postalCode": "65000"
          },
          {
            "name": "มะขามสูง",
            "postalCode": "65000"
          },
          {
            "name": "อรัญญิก",
            "postalCode": "65000"
          },
          {
            "name": "บึงพระ",
            "postalCode": "65000"
          },
          {
            "name": "ไผ่ขอดอน",
            "postalCode": "65000"
          },
          {
            "name": "งิ้วงาม",
            "postalCode": "65230"
          }
        ]
      },
      {
        "name": "นครไทย",
        "subDistricts": [
          {
            "name": "นครไทย",
            "postalCode": "65120"
          },
          {
            "name": "หนองกะท้าว",
            "postalCode": "65120"
          },
          {
            "name": "บ้านแยง",
            "postalCode": "65120"
          },
          {
            "name": "เนินเพิ่ม",
            "postalCode": "65120"
          },
          {
            "name": "นาบัว",
            "postalCode": "65120"
          },
          {
            "name": "นครชุม",
            "postalCode": "65120"
          },
          {
            "name": "น้ำกุ่ม",
            "postalCode": "65120"
          },
          {
            "name": "ยางโกลน",
            "postalCode": "65120"
          },
          {
            "name": "บ่อโพธิ์",
            "postalCode": "65120"
          },
          {
            "name": "บ้านพร้าว",
            "postalCode": "65120"
          },
          {
            "name": "ห้วยเฮี้ย",
            "postalCode": "65120"
          }
        ]
      },
      {
        "name": "ชาติตระการ",
        "subDistricts": [
          {
            "name": "ป่าแดง",
            "postalCode": "65170"
          },
          {
            "name": "ชาติตระการ",
            "postalCode": "65170"
          },
          {
            "name": "สวนเมี่ยง",
            "postalCode": "65170"
          },
          {
            "name": "บ้านดง",
            "postalCode": "65170"
          },
          {
            "name": "บ่อภาค",
            "postalCode": "65170"
          },
          {
            "name": "ท่าสะแก",
            "postalCode": "65170"
          }
        ]
      },
      {
        "name": "บางระกำ",
        "subDistricts": [
          {
            "name": "บางระกำ",
            "postalCode": "65140"
          },
          {
            "name": "ปลักแรด",
            "postalCode": "65140"
          },
          {
            "name": "พันเสา",
            "postalCode": "65140"
          },
          {
            "name": "วังอิทก",
            "postalCode": "65140"
          },
          {
            "name": "บึงกอก",
            "postalCode": "65140"
          },
          {
            "name": "หนองกุลา",
            "postalCode": "65140"
          },
          {
            "name": "ชุมแสงสงคราม",
            "postalCode": "65240"
          },
          {
            "name": "นิคมพัฒนา",
            "postalCode": "65140"
          },
          {
            "name": "บ่อทอง",
            "postalCode": "65140"
          },
          {
            "name": "ท่านางงาม",
            "postalCode": "65140"
          },
          {
            "name": "คุยม่วง",
            "postalCode": "65240"
          }
        ]
      },
      {
        "name": "บางกระทุ่ม",
        "subDistricts": [
          {
            "name": "บางกระทุ่ม",
            "postalCode": "65110"
          },
          {
            "name": "บ้านไร่",
            "postalCode": "65110"
          },
          {
            "name": "โคกสลุด",
            "postalCode": "65110"
          },
          {
            "name": "สนามคลี",
            "postalCode": "65110"
          },
          {
            "name": "ท่าตาล",
            "postalCode": "65110"
          },
          {
            "name": "ไผ่ล้อม",
            "postalCode": "65110"
          },
          {
            "name": "นครป่าหมาก",
            "postalCode": "65110"
          },
          {
            "name": "เนินกุ่ม",
            "postalCode": "65210"
          },
          {
            "name": "วัดตายม",
            "postalCode": "65210"
          }
        ]
      },
      {
        "name": "พรหมพิราม",
        "subDistricts": [
          {
            "name": "พรหมพิราม",
            "postalCode": "65150"
          },
          {
            "name": "ท่าช้าง",
            "postalCode": "65150"
          },
          {
            "name": "วงฆ้อง",
            "postalCode": "65180"
          },
          {
            "name": "มะตูม",
            "postalCode": "65150"
          },
          {
            "name": "หอกลอง",
            "postalCode": "65150"
          },
          {
            "name": "ศรีภิรมย์",
            "postalCode": "65180"
          },
          {
            "name": "ตลุกเทียม",
            "postalCode": "65180"
          },
          {
            "name": "วังวน",
            "postalCode": "65150"
          },
          {
            "name": "หนองแขม",
            "postalCode": "65150"
          },
          {
            "name": "มะต้อง",
            "postalCode": "65180"
          },
          {
            "name": "ทับยายเชียง",
            "postalCode": "65150"
          },
          {
            "name": "ดงประคำ",
            "postalCode": "65180"
          }
        ]
      },
      {
        "name": "วัดโบสถ์",
        "subDistricts": [
          {
            "name": "วัดโบสถ์",
            "postalCode": "65160"
          },
          {
            "name": "ท่างาม",
            "postalCode": "65160"
          },
          {
            "name": "ท้อแท้",
            "postalCode": "65160"
          },
          {
            "name": "บ้านยาง",
            "postalCode": "65160"
          },
          {
            "name": "หินลาด",
            "postalCode": "65160"
          },
          {
            "name": "คันโช้ง",
            "postalCode": "65160"
          }
        ]
      },
      {
        "name": "วังทอง",
        "subDistricts": [
          {
            "name": "วังทอง",
            "postalCode": "65130"
          },
          {
            "name": "พันชาลี",
            "postalCode": "65130"
          },
          {
            "name": "แม่ระกา",
            "postalCode": "65130"
          },
          {
            "name": "บ้านกลาง",
            "postalCode": "65220"
          },
          {
            "name": "วังพิกุล",
            "postalCode": "65130"
          },
          {
            "name": "แก่งโสภา",
            "postalCode": "65220"
          },
          {
            "name": "ท่าหมื่นราม",
            "postalCode": "65130"
          },
          {
            "name": "วังนกแอ่น",
            "postalCode": "65130"
          },
          {
            "name": "หนองพระ",
            "postalCode": "65130"
          },
          {
            "name": "ชัยนาม",
            "postalCode": "65130"
          },
          {
            "name": "ดินทอง",
            "postalCode": "65130"
          }
        ]
      },
      {
        "name": "เนินมะปราง",
        "subDistricts": [
          {
            "name": "ชมพู",
            "postalCode": "65190"
          },
          {
            "name": "บ้านมุง",
            "postalCode": "65190"
          },
          {
            "name": "ไทรย้อย",
            "postalCode": "65190"
          },
          {
            "name": "วังโพรง",
            "postalCode": "65190"
          },
          {
            "name": "บ้านน้อยซุ้มขี้เหล็ก",
            "postalCode": "65190"
          },
          {
            "name": "เนินมะปราง",
            "postalCode": "65190"
          },
          {
            "name": "วังยาง",
            "postalCode": "65190"
          },
          {
            "name": "โคกแหลม",
            "postalCode": "65190"
          }
        ]
      }
    ]
  },
  {
    "name": "พิจิตร",
    "districts": [
      {
        "name": "เมืองพิจิตร",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "66000"
          },
          {
            "name": "ไผ่ขวาง",
            "postalCode": "66000"
          },
          {
            "name": "ย่านยาว",
            "postalCode": "66000"
          },
          {
            "name": "ท่าฬ่อ",
            "postalCode": "66000"
          },
          {
            "name": "ปากทาง",
            "postalCode": "66000"
          },
          {
            "name": "คลองคะเชนทร์",
            "postalCode": "66000"
          },
          {
            "name": "โรงช้าง",
            "postalCode": "66000"
          },
          {
            "name": "เมืองเก่า",
            "postalCode": "66000"
          },
          {
            "name": "ท่าหลวง",
            "postalCode": "66000"
          },
          {
            "name": "บ้านบุ่ง",
            "postalCode": "66000"
          },
          {
            "name": "ฆะมัง",
            "postalCode": "66000"
          },
          {
            "name": "ดงป่าคำ",
            "postalCode": "66170"
          },
          {
            "name": "หัวดง",
            "postalCode": "66170"
          },
          {
            "name": "ป่ามะคาบ",
            "postalCode": "66000"
          },
          {
            "name": "สายคำโห้",
            "postalCode": "66000"
          },
          {
            "name": "ดงกลาง",
            "postalCode": "66170"
          }
        ]
      },
      {
        "name": "วังทรายพูน",
        "subDistricts": [
          {
            "name": "วังทรายพูน",
            "postalCode": "66180"
          },
          {
            "name": "หนองปลาไหล",
            "postalCode": "66180"
          },
          {
            "name": "หนองพระ",
            "postalCode": "66180"
          },
          {
            "name": "หนองปล้อง",
            "postalCode": "66180"
          }
        ]
      },
      {
        "name": "โพธิ์ประทับช้าง",
        "subDistricts": [
          {
            "name": "โพธิ์ประทับช้าง",
            "postalCode": "66190"
          },
          {
            "name": "ไผ่ท่าโพ",
            "postalCode": "66190"
          },
          {
            "name": "วังจิก",
            "postalCode": "66190"
          },
          {
            "name": "ไผ่รอบ",
            "postalCode": "66190"
          },
          {
            "name": "ดงเสือเหลือง",
            "postalCode": "66190"
          },
          {
            "name": "เนินสว่าง",
            "postalCode": "66190"
          },
          {
            "name": "ทุ่งใหญ่",
            "postalCode": "66190"
          }
        ]
      },
      {
        "name": "ตะพานหิน",
        "subDistricts": [
          {
            "name": "ตะพานหิน",
            "postalCode": "66110"
          },
          {
            "name": "งิ้วราย",
            "postalCode": "66110"
          },
          {
            "name": "ห้วยเกตุ",
            "postalCode": "66110"
          },
          {
            "name": "ไทรโรงโขน",
            "postalCode": "66110"
          },
          {
            "name": "หนองพยอม",
            "postalCode": "66110"
          },
          {
            "name": "ทุ่งโพธิ์",
            "postalCode": "66150"
          },
          {
            "name": "ดงตะขบ",
            "postalCode": "66110"
          },
          {
            "name": "คลองคูณ",
            "postalCode": "66110"
          },
          {
            "name": "วังสำโรง",
            "postalCode": "66110"
          },
          {
            "name": "วังหว้า",
            "postalCode": "66110"
          },
          {
            "name": "วังหลุม",
            "postalCode": "66150"
          },
          {
            "name": "ทับหมัน",
            "postalCode": "66110"
          },
          {
            "name": "ไผ่หลวง",
            "postalCode": "66110"
          }
        ]
      },
      {
        "name": "บางมูลนาก",
        "subDistricts": [
          {
            "name": "บางมูลนาก",
            "postalCode": "66120"
          },
          {
            "name": "บางไผ่",
            "postalCode": "66120"
          },
          {
            "name": "หอไกร",
            "postalCode": "66120"
          },
          {
            "name": "เนินมะกอก",
            "postalCode": "66120"
          },
          {
            "name": "วังสำโรง",
            "postalCode": "66120"
          },
          {
            "name": "ภูมิ",
            "postalCode": "66120"
          },
          {
            "name": "วังกรด",
            "postalCode": "66120"
          },
          {
            "name": "ห้วยเขน",
            "postalCode": "66120"
          },
          {
            "name": "วังตะกู",
            "postalCode": "66210"
          },
          {
            "name": "ลำประดา",
            "postalCode": "66120"
          }
        ]
      },
      {
        "name": "โพทะเล",
        "subDistricts": [
          {
            "name": "โพทะเล",
            "postalCode": "66130"
          },
          {
            "name": "ท้ายน้ำ",
            "postalCode": "66130"
          },
          {
            "name": "ทะนง",
            "postalCode": "66130"
          },
          {
            "name": "ท่าบัว",
            "postalCode": "66130"
          },
          {
            "name": "ทุ่งน้อย",
            "postalCode": "66130"
          },
          {
            "name": "ท่าขมิ้น",
            "postalCode": "66130"
          },
          {
            "name": "ท่าเสา",
            "postalCode": "66130"
          },
          {
            "name": "บางคลาน",
            "postalCode": "66130"
          },
          {
            "name": "ท่านั่ง",
            "postalCode": "66130"
          },
          {
            "name": "บ้านน้อย",
            "postalCode": "66130"
          },
          {
            "name": "วัดขวาง",
            "postalCode": "66130"
          }
        ]
      },
      {
        "name": "สามง่าม",
        "subDistricts": [
          {
            "name": "สามง่าม",
            "postalCode": "66140"
          },
          {
            "name": "กำแพงดิน",
            "postalCode": "66140"
          },
          {
            "name": "รังนก",
            "postalCode": "66140"
          },
          {
            "name": "เนินปอ",
            "postalCode": "66140"
          },
          {
            "name": "หนองโสน",
            "postalCode": "66140"
          }
        ]
      },
      {
        "name": "ทับคล้อ",
        "subDistricts": [
          {
            "name": "ทับคล้อ",
            "postalCode": "66150"
          },
          {
            "name": "เขาทราย",
            "postalCode": "66230"
          },
          {
            "name": "เขาเจ็ดลูก",
            "postalCode": "66230"
          },
          {
            "name": "ท้ายทุ่ง",
            "postalCode": "66150"
          }
        ]
      },
      {
        "name": "สากเหล็ก",
        "subDistricts": [
          {
            "name": "สากเหล็ก",
            "postalCode": "66160"
          },
          {
            "name": "ท่าเยี่ยม",
            "postalCode": "66160"
          },
          {
            "name": "คลองทราย",
            "postalCode": "66160"
          },
          {
            "name": "หนองหญ้าไทร",
            "postalCode": "66160"
          },
          {
            "name": "วังทับไทร",
            "postalCode": "66160"
          }
        ]
      },
      {
        "name": "บึงนาราง",
        "subDistricts": [
          {
            "name": "ห้วยแก้ว",
            "postalCode": "66130"
          },
          {
            "name": "โพธิ์ไทรงาม",
            "postalCode": "66130"
          },
          {
            "name": "แหลมรัง",
            "postalCode": "66130"
          },
          {
            "name": "บางลาย",
            "postalCode": "66130"
          },
          {
            "name": "บึงนาราง",
            "postalCode": "66130"
          }
        ]
      },
      {
        "name": "ดงเจริญ",
        "subDistricts": [
          {
            "name": "วังงิ้วใต้",
            "postalCode": "66210"
          },
          {
            "name": "วังงิ้ว",
            "postalCode": "66210"
          },
          {
            "name": "ห้วยร่วม",
            "postalCode": "66210"
          },
          {
            "name": "ห้วยพุก",
            "postalCode": "66210"
          },
          {
            "name": "สำนักขุนเณร",
            "postalCode": "66210"
          }
        ]
      },
      {
        "name": "วชิรบารมี",
        "subDistricts": [
          {
            "name": "บ้านนา",
            "postalCode": "66140"
          },
          {
            "name": "บึงบัว",
            "postalCode": "66140"
          },
          {
            "name": "วังโมกข์",
            "postalCode": "66140"
          },
          {
            "name": "หนองหลุม",
            "postalCode": "66220"
          }
        ]
      }
    ]
  },
  {
    "name": "เพชรบูรณ์",
    "districts": [
      {
        "name": "เมืองเพชรบูรณ์",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "67000"
          },
          {
            "name": "ตะเบาะ",
            "postalCode": "67000"
          },
          {
            "name": "บ้านโตก",
            "postalCode": "67000"
          },
          {
            "name": "สะเดียง",
            "postalCode": "67000"
          },
          {
            "name": "ป่าเลา",
            "postalCode": "67000"
          },
          {
            "name": "นางั่ว",
            "postalCode": "67000"
          },
          {
            "name": "ท่าพล",
            "postalCode": "67250"
          },
          {
            "name": "ดงมูลเหล็ก",
            "postalCode": "67000"
          },
          {
            "name": "บ้านโคก",
            "postalCode": "67000"
          },
          {
            "name": "ชอนไพร",
            "postalCode": "67000"
          },
          {
            "name": "นาป่า",
            "postalCode": "67000"
          },
          {
            "name": "นายม",
            "postalCode": "67210"
          },
          {
            "name": "วังชมภู",
            "postalCode": "67210"
          },
          {
            "name": "น้ำร้อน",
            "postalCode": "67000"
          },
          {
            "name": "ห้วยสะแก",
            "postalCode": "67210"
          },
          {
            "name": "ห้วยใหญ่",
            "postalCode": "67000"
          },
          {
            "name": "ระวิง",
            "postalCode": "67210"
          }
        ]
      },
      {
        "name": "ชนแดน",
        "subDistricts": [
          {
            "name": "ชนแดน",
            "postalCode": "67150"
          },
          {
            "name": "ดงขุย",
            "postalCode": "67190"
          },
          {
            "name": "ท่าข้าม",
            "postalCode": "67150"
          },
          {
            "name": "พุทธบาท",
            "postalCode": "67150"
          },
          {
            "name": "ลาดแค",
            "postalCode": "67150"
          },
          {
            "name": "บ้านกล้วย",
            "postalCode": "67190"
          },
          {
            "name": "ซับพุทรา",
            "postalCode": "67150"
          },
          {
            "name": "ตะกุดไร",
            "postalCode": "67190"
          },
          {
            "name": "ศาลาลาย",
            "postalCode": "67150"
          }
        ]
      },
      {
        "name": "หล่มสัก",
        "subDistricts": [
          {
            "name": "หล่มสัก",
            "postalCode": "67110"
          },
          {
            "name": "วัดป่า",
            "postalCode": "67110"
          },
          {
            "name": "ตาลเดี่ยว",
            "postalCode": "67110"
          },
          {
            "name": "ฝายนาแซง",
            "postalCode": "67110"
          },
          {
            "name": "หนองสว่าง",
            "postalCode": "67110"
          },
          {
            "name": "น้ำเฮี้ย",
            "postalCode": "67110"
          },
          {
            "name": "สักหลง",
            "postalCode": "67110"
          },
          {
            "name": "ท่าอิบุญ",
            "postalCode": "67110"
          },
          {
            "name": "บ้านโสก",
            "postalCode": "67110"
          },
          {
            "name": "บ้านติ้ว",
            "postalCode": "67110"
          },
          {
            "name": "ห้วยไร่",
            "postalCode": "67110"
          },
          {
            "name": "น้ำก้อ",
            "postalCode": "67110"
          },
          {
            "name": "ปากช่อง",
            "postalCode": "67110"
          },
          {
            "name": "น้ำชุน",
            "postalCode": "67110"
          },
          {
            "name": "หนองไขว่",
            "postalCode": "67110"
          },
          {
            "name": "ลานบ่า",
            "postalCode": "67110"
          },
          {
            "name": "บุ่งคล้า",
            "postalCode": "67110"
          },
          {
            "name": "บุ่งน้ำเต้า",
            "postalCode": "67110"
          },
          {
            "name": "บ้านกลาง",
            "postalCode": "67110"
          },
          {
            "name": "ช้างตะลูด",
            "postalCode": "67110"
          },
          {
            "name": "บ้านไร่",
            "postalCode": "67110"
          },
          {
            "name": "ปากดุก",
            "postalCode": "67110"
          },
          {
            "name": "บ้านหวาย",
            "postalCode": "67110"
          }
        ]
      },
      {
        "name": "หล่มเก่า",
        "subDistricts": [
          {
            "name": "หล่มเก่า",
            "postalCode": "67120"
          },
          {
            "name": "นาซำ",
            "postalCode": "67120"
          },
          {
            "name": "หินฮาว",
            "postalCode": "67120"
          },
          {
            "name": "บ้านเนิน",
            "postalCode": "67120"
          },
          {
            "name": "ศิลา",
            "postalCode": "67120"
          },
          {
            "name": "นาแซง",
            "postalCode": "67120"
          },
          {
            "name": "วังบาล",
            "postalCode": "67120"
          },
          {
            "name": "นาเกาะ",
            "postalCode": "67120"
          },
          {
            "name": "ตาดกลอย",
            "postalCode": "67120"
          }
        ]
      },
      {
        "name": "วิเชียรบุรี",
        "subDistricts": [
          {
            "name": "ท่าโรง",
            "postalCode": "67130"
          },
          {
            "name": "สระประดู่",
            "postalCode": "67130"
          },
          {
            "name": "สามแยก",
            "postalCode": "67130"
          },
          {
            "name": "โคกปรง",
            "postalCode": "67130"
          },
          {
            "name": "น้ำร้อน",
            "postalCode": "67130"
          },
          {
            "name": "บ่อรัง",
            "postalCode": "67130"
          },
          {
            "name": "พุเตย",
            "postalCode": "67180"
          },
          {
            "name": "พุขาม",
            "postalCode": "67180"
          },
          {
            "name": "ภูน้ำหยด",
            "postalCode": "67180"
          },
          {
            "name": "ซับสมบูรณ์",
            "postalCode": "67180"
          },
          {
            "name": "บึงกระจับ",
            "postalCode": "67130"
          },
          {
            "name": "วังใหญ่",
            "postalCode": "67180"
          },
          {
            "name": "ยางสาว",
            "postalCode": "67130"
          },
          {
            "name": "ซับน้อย",
            "postalCode": "67180"
          }
        ]
      },
      {
        "name": "ศรีเทพ",
        "subDistricts": [
          {
            "name": "ศรีเทพ",
            "postalCode": "67170"
          },
          {
            "name": "สระกรวด",
            "postalCode": "67170"
          },
          {
            "name": "คลองกระจัง",
            "postalCode": "67170"
          },
          {
            "name": "นาสนุ่น",
            "postalCode": "67170"
          },
          {
            "name": "โคกสะอาด",
            "postalCode": "67170"
          },
          {
            "name": "หนองย่างทอย",
            "postalCode": "67170"
          },
          {
            "name": "ประดู่งาม",
            "postalCode": "67170"
          }
        ]
      },
      {
        "name": "หนองไผ่",
        "subDistricts": [
          {
            "name": "กองทูล",
            "postalCode": "67140"
          },
          {
            "name": "นาเฉลียง",
            "postalCode": "67220"
          },
          {
            "name": "บ้านโภชน์",
            "postalCode": "67140"
          },
          {
            "name": "ท่าแดง",
            "postalCode": "67140"
          },
          {
            "name": "เพชรละคร",
            "postalCode": "67140"
          },
          {
            "name": "บ่อไทย",
            "postalCode": "67140"
          },
          {
            "name": "ห้วยโป่ง",
            "postalCode": "67220"
          },
          {
            "name": "วังท่าดี",
            "postalCode": "67140"
          },
          {
            "name": "บัววัฒนา",
            "postalCode": "67140"
          },
          {
            "name": "หนองไผ่",
            "postalCode": "67140"
          },
          {
            "name": "วังโบสถ์",
            "postalCode": "67140"
          },
          {
            "name": "ยางงาม",
            "postalCode": "67220"
          },
          {
            "name": "ท่าด้วง",
            "postalCode": "67140"
          }
        ]
      },
      {
        "name": "บึงสามพัน",
        "subDistricts": [
          {
            "name": "ซับสมอทอด",
            "postalCode": "67160"
          },
          {
            "name": "ซับไม้แดง",
            "postalCode": "67160"
          },
          {
            "name": "หนองแจง",
            "postalCode": "67160"
          },
          {
            "name": "กันจุ",
            "postalCode": "67160"
          },
          {
            "name": "วังพิกุล",
            "postalCode": "67230"
          },
          {
            "name": "พญาวัง",
            "postalCode": "67160"
          },
          {
            "name": "ศรีมงคล",
            "postalCode": "67160"
          },
          {
            "name": "สระแก้ว",
            "postalCode": "67160"
          },
          {
            "name": "บึงสามพัน",
            "postalCode": "67160"
          }
        ]
      },
      {
        "name": "น้ำหนาว",
        "subDistricts": [
          {
            "name": "น้ำหนาว",
            "postalCode": "67260"
          },
          {
            "name": "หลักด่าน",
            "postalCode": "67260"
          },
          {
            "name": "วังกวาง",
            "postalCode": "67260"
          },
          {
            "name": "โคกมน",
            "postalCode": "67260"
          }
        ]
      },
      {
        "name": "วังโป่ง",
        "subDistricts": [
          {
            "name": "วังโป่ง",
            "postalCode": "67240"
          },
          {
            "name": "ท้ายดง",
            "postalCode": "67240"
          },
          {
            "name": "ซับเปิบ",
            "postalCode": "67240"
          },
          {
            "name": "วังหิน",
            "postalCode": "67240"
          },
          {
            "name": "วังศาล",
            "postalCode": "67240"
          }
        ]
      },
      {
        "name": "เขาค้อ",
        "subDistricts": [
          {
            "name": "ทุ่งสมอ",
            "postalCode": "67270"
          },
          {
            "name": "แคมป์สน",
            "postalCode": "67280"
          },
          {
            "name": "เขาค้อ",
            "postalCode": "67270"
          },
          {
            "name": "ริมสีม่วง",
            "postalCode": "67270"
          },
          {
            "name": "สะเดาะพง",
            "postalCode": "67270"
          },
          {
            "name": "หนองแม่นา",
            "postalCode": "67270"
          },
          {
            "name": "เข็กน้อย",
            "postalCode": "67280"
          }
        ]
      }
    ]
  },
  {
    "name": "ราชบุรี",
    "districts": [
      {
        "name": "เมืองราชบุรี",
        "subDistricts": [
          {
            "name": "หน้าเมือง",
            "postalCode": "70000"
          },
          {
            "name": "เจดีย์หัก",
            "postalCode": "70000"
          },
          {
            "name": "ดอนตะโก",
            "postalCode": "70000"
          },
          {
            "name": "หนองกลางนา",
            "postalCode": "70000"
          },
          {
            "name": "ห้วยไผ่",
            "postalCode": "70000"
          },
          {
            "name": "คุ้งน้ำวน",
            "postalCode": "70000"
          },
          {
            "name": "คุ้งกระถิน",
            "postalCode": "70000"
          },
          {
            "name": "อ่างทอง",
            "postalCode": "70000"
          },
          {
            "name": "โคกหม้อ",
            "postalCode": "70000"
          },
          {
            "name": "สามเรือน",
            "postalCode": "70000"
          },
          {
            "name": "พิกุลทอง",
            "postalCode": "70000"
          },
          {
            "name": "น้ำพุ",
            "postalCode": "70000"
          },
          {
            "name": "ดอนแร่",
            "postalCode": "70000"
          },
          {
            "name": "หินกอง",
            "postalCode": "70000"
          },
          {
            "name": "เขาแร้ง",
            "postalCode": "70000"
          },
          {
            "name": "เกาะพลับพลา",
            "postalCode": "70000"
          },
          {
            "name": "หลุมดิน",
            "postalCode": "70000"
          },
          {
            "name": "บางป่า",
            "postalCode": "70000"
          },
          {
            "name": "พงสวาย",
            "postalCode": "70000"
          },
          {
            "name": "คูบัว",
            "postalCode": "70000"
          },
          {
            "name": "ท่าราบ",
            "postalCode": "70000"
          },
          {
            "name": "บ้านไร่",
            "postalCode": "70000"
          }
        ]
      },
      {
        "name": "จอมบึง",
        "subDistricts": [
          {
            "name": "จอมบึง",
            "postalCode": "70150"
          },
          {
            "name": "ปากช่อง",
            "postalCode": "70150"
          },
          {
            "name": "เบิกไพร",
            "postalCode": "70150"
          },
          {
            "name": "ด่านทับตะโก",
            "postalCode": "70150"
          },
          {
            "name": "แก้มอ้น",
            "postalCode": "70150"
          },
          {
            "name": "รางบัว",
            "postalCode": "70150"
          }
        ]
      },
      {
        "name": "สวนผึ้ง",
        "subDistricts": [
          {
            "name": "สวนผึ้ง",
            "postalCode": "70180"
          },
          {
            "name": "ป่าหวาย",
            "postalCode": "70180"
          },
          {
            "name": "ท่าเคย",
            "postalCode": "70180"
          },
          {
            "name": "ตะนาวศรี",
            "postalCode": "70180"
          }
        ]
      },
      {
        "name": "ดำเนินสะดวก",
        "subDistricts": [
          {
            "name": "ดำเนินสะดวก",
            "postalCode": "70130"
          },
          {
            "name": "ประสาทสิทธิ์",
            "postalCode": "70210"
          },
          {
            "name": "ศรีสุราษฎร์",
            "postalCode": "70130"
          },
          {
            "name": "ตาหลวง",
            "postalCode": "70130"
          },
          {
            "name": "ดอนกรวย",
            "postalCode": "70130"
          },
          {
            "name": "ดอนคลัง",
            "postalCode": "70130"
          },
          {
            "name": "บัวงาม",
            "postalCode": "70210"
          },
          {
            "name": "บ้านไร่",
            "postalCode": "70130"
          },
          {
            "name": "แพงพวย",
            "postalCode": "70130"
          },
          {
            "name": "สี่หมื่น",
            "postalCode": "70130"
          },
          {
            "name": "ท่านัด",
            "postalCode": "70130"
          },
          {
            "name": "ขุนพิทักษ์",
            "postalCode": "70130"
          },
          {
            "name": "ดอนไผ่",
            "postalCode": "70130"
          }
        ]
      },
      {
        "name": "บ้านโป่ง",
        "subDistricts": [
          {
            "name": "บ้านโป่ง",
            "postalCode": "70110"
          },
          {
            "name": "ท่าผา",
            "postalCode": "70110"
          },
          {
            "name": "กรับใหญ่",
            "postalCode": "70190"
          },
          {
            "name": "ปากแรต",
            "postalCode": "70110"
          },
          {
            "name": "หนองกบ",
            "postalCode": "70110"
          },
          {
            "name": "หนองอ้อ",
            "postalCode": "70110"
          },
          {
            "name": "ดอนกระเบื้อง",
            "postalCode": "70110"
          },
          {
            "name": "สวนกล้วย",
            "postalCode": "70110"
          },
          {
            "name": "นครชุมน์",
            "postalCode": "70110"
          },
          {
            "name": "บ้านม่วง",
            "postalCode": "70110"
          },
          {
            "name": "คุ้งพยอม",
            "postalCode": "70110"
          },
          {
            "name": "หนองปลาหมอ",
            "postalCode": "70110"
          },
          {
            "name": "เขาขลุง",
            "postalCode": "70110"
          },
          {
            "name": "เบิกไพร",
            "postalCode": "70110"
          },
          {
            "name": "ลาดบัวขาว",
            "postalCode": "70110"
          }
        ]
      },
      {
        "name": "บางแพ",
        "subDistricts": [
          {
            "name": "บางแพ",
            "postalCode": "70160"
          },
          {
            "name": "วังเย็น",
            "postalCode": "70160"
          },
          {
            "name": "หัวโพ",
            "postalCode": "70160"
          },
          {
            "name": "วัดแก้ว",
            "postalCode": "70160"
          },
          {
            "name": "ดอนใหญ่",
            "postalCode": "70160"
          },
          {
            "name": "ดอนคา",
            "postalCode": "70160"
          },
          {
            "name": "โพหัก",
            "postalCode": "70160"
          }
        ]
      },
      {
        "name": "โพธาราม",
        "subDistricts": [
          {
            "name": "โพธาราม",
            "postalCode": "70120"
          },
          {
            "name": "ดอนกระเบื้อง",
            "postalCode": "70120"
          },
          {
            "name": "หนองโพ",
            "postalCode": "70120"
          },
          {
            "name": "บ้านเลือก",
            "postalCode": "70120"
          },
          {
            "name": "คลองตาคต",
            "postalCode": "70120"
          },
          {
            "name": "บ้านฆ้อง",
            "postalCode": "70120"
          },
          {
            "name": "บ้านสิงห์",
            "postalCode": "70120"
          },
          {
            "name": "ดอนทราย",
            "postalCode": "70120"
          },
          {
            "name": "เจ็ดเสมียน",
            "postalCode": "70120"
          },
          {
            "name": "คลองข่อย",
            "postalCode": "70120"
          },
          {
            "name": "ชำแระ",
            "postalCode": "70120"
          },
          {
            "name": "สร้อยฟ้า",
            "postalCode": "70120"
          },
          {
            "name": "ท่าชุมพล",
            "postalCode": "70120"
          },
          {
            "name": "บางโตนด",
            "postalCode": "70120"
          },
          {
            "name": "เตาปูน",
            "postalCode": "70120"
          },
          {
            "name": "นางแก้ว",
            "postalCode": "70120"
          },
          {
            "name": "ธรรมเสน",
            "postalCode": "70120"
          },
          {
            "name": "เขาชะงุ้ม",
            "postalCode": "70120"
          },
          {
            "name": "หนองกวาง",
            "postalCode": "70120"
          }
        ]
      },
      {
        "name": "ปากท่อ",
        "subDistricts": [
          {
            "name": "ทุ่งหลวง",
            "postalCode": "70140"
          },
          {
            "name": "วังมะนาว",
            "postalCode": "70140"
          },
          {
            "name": "ดอนทราย",
            "postalCode": "70140"
          },
          {
            "name": "หนองกระทุ่ม",
            "postalCode": "70140"
          },
          {
            "name": "ปากท่อ",
            "postalCode": "70140"
          },
          {
            "name": "ป่าไก่",
            "postalCode": "70140"
          },
          {
            "name": "วัดยางงาม",
            "postalCode": "70140"
          },
          {
            "name": "อ่างหิน",
            "postalCode": "70140"
          },
          {
            "name": "บ่อกระดาน",
            "postalCode": "70140"
          },
          {
            "name": "ยางหัก",
            "postalCode": "70140"
          },
          {
            "name": "วันดาว",
            "postalCode": "70140"
          },
          {
            "name": "ห้วยยางโทน",
            "postalCode": "70140"
          }
        ]
      },
      {
        "name": "วัดเพลง",
        "subDistricts": [
          {
            "name": "เกาะศาลพระ",
            "postalCode": "70170"
          },
          {
            "name": "จอมประทัด",
            "postalCode": "70170"
          },
          {
            "name": "วัดเพลง",
            "postalCode": "70170"
          }
        ]
      },
      {
        "name": "บ้านคา",
        "subDistricts": [
          {
            "name": "บ้านคา",
            "postalCode": "70180"
          },
          {
            "name": "บ้านบึง",
            "postalCode": "70180"
          },
          {
            "name": "หนองพันจันทร์",
            "postalCode": "70180"
          }
        ]
      }
    ]
  },
  {
    "name": "กาญจนบุรี",
    "districts": [
      {
        "name": "เมืองกาญจนบุรี",
        "subDistricts": [
          {
            "name": "บ้านเหนือ",
            "postalCode": "71000"
          },
          {
            "name": "บ้านใต้",
            "postalCode": "71000"
          },
          {
            "name": "ปากแพรก",
            "postalCode": "71000"
          },
          {
            "name": "ท่ามะขาม",
            "postalCode": "71000"
          },
          {
            "name": "แก่งเสี้ยน",
            "postalCode": "71000"
          },
          {
            "name": "หนองบัว",
            "postalCode": "71190"
          },
          {
            "name": "ลาดหญ้า",
            "postalCode": "71190"
          },
          {
            "name": "วังด้ง",
            "postalCode": "71190"
          },
          {
            "name": "ช่องสะเดา",
            "postalCode": "71190"
          },
          {
            "name": "หนองหญ้า",
            "postalCode": "71000"
          },
          {
            "name": "เกาะสำโรง",
            "postalCode": "71000"
          },
          {
            "name": "บ้านเก่า",
            "postalCode": "71000"
          },
          {
            "name": "วังเย็น",
            "postalCode": "71000"
          }
        ]
      },
      {
        "name": "ไทรโยค",
        "subDistricts": [
          {
            "name": "ลุ่มสุ่ม",
            "postalCode": "71150"
          },
          {
            "name": "ท่าเสา",
            "postalCode": "71150"
          },
          {
            "name": "สิงห์",
            "postalCode": "71150"
          },
          {
            "name": "ไทรโยค",
            "postalCode": "71150"
          },
          {
            "name": "วังกระแจะ",
            "postalCode": "71150"
          },
          {
            "name": "ศรีมงคล",
            "postalCode": "71150"
          },
          {
            "name": "บ้องตี้",
            "postalCode": "71150"
          }
        ]
      },
      {
        "name": "บ่อพลอย",
        "subDistricts": [
          {
            "name": "บ่อพลอย",
            "postalCode": "71160"
          },
          {
            "name": "หนองกุ่ม",
            "postalCode": "71160"
          },
          {
            "name": "หนองรี",
            "postalCode": "71220"
          },
          {
            "name": "หลุมรัง",
            "postalCode": "71160"
          },
          {
            "name": "ช่องด่าน",
            "postalCode": "71160"
          },
          {
            "name": "หนองกร่าง",
            "postalCode": "71220"
          }
        ]
      },
      {
        "name": "ศรีสวัสดิ์",
        "subDistricts": [
          {
            "name": "นาสวน",
            "postalCode": "71250"
          },
          {
            "name": "ด่านแม่แฉลบ",
            "postalCode": "71250"
          },
          {
            "name": "หนองเป็ด",
            "postalCode": "71250"
          },
          {
            "name": "ท่ากระดาน",
            "postalCode": "71250"
          },
          {
            "name": "เขาโจด",
            "postalCode": "71220"
          },
          {
            "name": "แม่กระบุง",
            "postalCode": "71250"
          }
        ]
      },
      {
        "name": "ท่ามะกา",
        "subDistricts": [
          {
            "name": "พงตึก",
            "postalCode": "71120"
          },
          {
            "name": "ยางม่วง",
            "postalCode": "71120"
          },
          {
            "name": "ดอนชะเอม",
            "postalCode": "71130"
          },
          {
            "name": "ท่าไม้",
            "postalCode": "71120"
          },
          {
            "name": "ตะคร้ำเอน",
            "postalCode": "71130"
          },
          {
            "name": "ท่ามะกา",
            "postalCode": "71120"
          },
          {
            "name": "ท่าเรือ",
            "postalCode": "71130"
          },
          {
            "name": "โคกตะบอง",
            "postalCode": "71120"
          },
          {
            "name": "ดอนขมิ้น",
            "postalCode": "71120"
          },
          {
            "name": "อุโลกสี่หมื่น",
            "postalCode": "71130"
          },
          {
            "name": "เขาสามสิบหาบ",
            "postalCode": "71120"
          },
          {
            "name": "พระแท่น",
            "postalCode": "71130"
          },
          {
            "name": "หวายเหนียว",
            "postalCode": "71120"
          },
          {
            "name": "แสนตอ",
            "postalCode": "71130"
          },
          {
            "name": "สนามแย้",
            "postalCode": "70190"
          },
          {
            "name": "ท่าเสา",
            "postalCode": "71120"
          },
          {
            "name": "หนองลาน",
            "postalCode": "71130"
          }
        ]
      },
      {
        "name": "ท่าม่วง",
        "subDistricts": [
          {
            "name": "ท่าม่วง",
            "postalCode": "71110"
          },
          {
            "name": "วังขนาย",
            "postalCode": "71110"
          },
          {
            "name": "วังศาลา",
            "postalCode": "71110"
          },
          {
            "name": "ท่าล้อ",
            "postalCode": "71110"
          },
          {
            "name": "หนองขาว",
            "postalCode": "71110"
          },
          {
            "name": "ทุ่งทอง",
            "postalCode": "71110"
          },
          {
            "name": "เขาน้อย",
            "postalCode": "71110"
          },
          {
            "name": "ม่วงชุม",
            "postalCode": "71110"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "71110"
          },
          {
            "name": "พังตรุ",
            "postalCode": "71110"
          },
          {
            "name": "ท่าตะคร้อ",
            "postalCode": "71130"
          },
          {
            "name": "รางสาลี่",
            "postalCode": "71110"
          },
          {
            "name": "หนองตากยา",
            "postalCode": "71110"
          }
        ]
      },
      {
        "name": "ทองผาภูมิ",
        "subDistricts": [
          {
            "name": "ท่าขนุน",
            "postalCode": "71180"
          },
          {
            "name": "ปิล๊อก",
            "postalCode": "71180"
          },
          {
            "name": "หินดาด",
            "postalCode": "71180"
          },
          {
            "name": "ลิ่นถิ่น",
            "postalCode": "71180"
          },
          {
            "name": "ชะแล",
            "postalCode": "71180"
          },
          {
            "name": "ห้วยเขย่ง",
            "postalCode": "71180"
          },
          {
            "name": "สหกรณ์นิคม",
            "postalCode": "71180"
          }
        ]
      },
      {
        "name": "สังขละบุรี",
        "subDistricts": [
          {
            "name": "หนองลู",
            "postalCode": "71240"
          },
          {
            "name": "ปรังเผล",
            "postalCode": "71240"
          },
          {
            "name": "ไล่โว่",
            "postalCode": "71240"
          }
        ]
      },
      {
        "name": "พนมทวน",
        "subDistricts": [
          {
            "name": "พนมทวน",
            "postalCode": "71140"
          },
          {
            "name": "หนองโรง",
            "postalCode": "71140"
          },
          {
            "name": "ทุ่งสมอ",
            "postalCode": "71140"
          },
          {
            "name": "ดอนเจดีย์",
            "postalCode": "71140"
          },
          {
            "name": "พังตรุ",
            "postalCode": "71140"
          },
          {
            "name": "รางหวาย",
            "postalCode": "71170"
          },
          {
            "name": "หนองสาหร่าย",
            "postalCode": "71140"
          },
          {
            "name": "ดอนตาเพชร",
            "postalCode": "71140"
          }
        ]
      },
      {
        "name": "เลาขวัญ",
        "subDistricts": [
          {
            "name": "เลาขวัญ",
            "postalCode": "71210"
          },
          {
            "name": "หนองโสน",
            "postalCode": "71210"
          },
          {
            "name": "หนองประดู่",
            "postalCode": "71210"
          },
          {
            "name": "หนองปลิง",
            "postalCode": "71210"
          },
          {
            "name": "หนองนกแก้ว",
            "postalCode": "71210"
          },
          {
            "name": "ทุ่งกระบ่ำ",
            "postalCode": "71210"
          },
          {
            "name": "หนองฝ้าย",
            "postalCode": "71210"
          }
        ]
      },
      {
        "name": "ด่านมะขามเตี้ย",
        "subDistricts": [
          {
            "name": "ด่านมะขามเตี้ย",
            "postalCode": "71260"
          },
          {
            "name": "กลอนโด",
            "postalCode": "71260"
          },
          {
            "name": "จรเข้เผือก",
            "postalCode": "71260"
          },
          {
            "name": "หนองไผ่",
            "postalCode": "71260"
          }
        ]
      },
      {
        "name": "หนองปรือ",
        "subDistricts": [
          {
            "name": "หนองปรือ",
            "postalCode": "71220"
          },
          {
            "name": "หนองปลาไหล",
            "postalCode": "71220"
          },
          {
            "name": "สมเด็จเจริญ",
            "postalCode": "71220"
          }
        ]
      },
      {
        "name": "ห้วยกระเจา",
        "subDistricts": [
          {
            "name": "ห้วยกระเจา",
            "postalCode": "71170"
          },
          {
            "name": "วังไผ่",
            "postalCode": "71170"
          },
          {
            "name": "ดอนแสลบ",
            "postalCode": "71170"
          },
          {
            "name": "สระลงเรือ",
            "postalCode": "71170"
          }
        ]
      }
    ]
  },
  {
    "name": "สุพรรณบุรี",
    "districts": [
      {
        "name": "เมืองสุพรรณบุรี",
        "subDistricts": [
          {
            "name": "ท่าพี่เลี้ยง",
            "postalCode": "72000"
          },
          {
            "name": "รั้วใหญ่",
            "postalCode": "72000"
          },
          {
            "name": "ทับตีเหล็ก",
            "postalCode": "72000"
          },
          {
            "name": "ท่าระหัด",
            "postalCode": "72000"
          },
          {
            "name": "ไผ่ขวาง",
            "postalCode": "72000"
          },
          {
            "name": "โคกโคเฒ่า",
            "postalCode": "72000"
          },
          {
            "name": "ดอนตาล",
            "postalCode": "72000"
          },
          {
            "name": "ดอนมะสังข์",
            "postalCode": "72000"
          },
          {
            "name": "พิหารแดง",
            "postalCode": "72000"
          },
          {
            "name": "ดอนกำยาน",
            "postalCode": "72000"
          },
          {
            "name": "ดอนโพธิ์ทอง",
            "postalCode": "72000"
          },
          {
            "name": "บ้านโพธิ์",
            "postalCode": "72000"
          },
          {
            "name": "สระแก้ว",
            "postalCode": "72230"
          },
          {
            "name": "ตลิ่งชัน",
            "postalCode": "72230"
          },
          {
            "name": "บางกุ้ง",
            "postalCode": "72210"
          },
          {
            "name": "ศาลาขาว",
            "postalCode": "72210"
          },
          {
            "name": "สวนแตง",
            "postalCode": "72210"
          },
          {
            "name": "สนามชัย",
            "postalCode": "72000"
          },
          {
            "name": "โพธิ์พระยา",
            "postalCode": "72000"
          },
          {
            "name": "สนามคลี",
            "postalCode": "72230"
          }
        ]
      },
      {
        "name": "เดิมบางนางบวช",
        "subDistricts": [
          {
            "name": "เขาพระ",
            "postalCode": "72120"
          },
          {
            "name": "เดิมบาง",
            "postalCode": "72120"
          },
          {
            "name": "นางบวช",
            "postalCode": "72120"
          },
          {
            "name": "เขาดิน",
            "postalCode": "72120"
          },
          {
            "name": "ปากน้ำ",
            "postalCode": "72120"
          },
          {
            "name": "ทุ่งคลี",
            "postalCode": "72120"
          },
          {
            "name": "โคกช้าง",
            "postalCode": "72120"
          },
          {
            "name": "หัวเขา",
            "postalCode": "72120"
          },
          {
            "name": "หัวนา",
            "postalCode": "72120"
          },
          {
            "name": "บ่อกรุ",
            "postalCode": "72120"
          },
          {
            "name": "วังศรีราช",
            "postalCode": "72120"
          },
          {
            "name": "ป่าสะแก",
            "postalCode": "72120"
          },
          {
            "name": "ยางนอน",
            "postalCode": "72120"
          },
          {
            "name": "หนองกระทุ่ม",
            "postalCode": "72120"
          }
        ]
      },
      {
        "name": "ด่านช้าง",
        "subDistricts": [
          {
            "name": "หนองมะค่าโมง",
            "postalCode": "72180"
          },
          {
            "name": "ด่านช้าง",
            "postalCode": "72180"
          },
          {
            "name": "ห้วยขมิ้น",
            "postalCode": "72180"
          },
          {
            "name": "องค์พระ",
            "postalCode": "72180"
          },
          {
            "name": "วังคัน",
            "postalCode": "72180"
          },
          {
            "name": "นิคมกระเสียว",
            "postalCode": "72180"
          },
          {
            "name": "วังยาว",
            "postalCode": "72180"
          }
        ]
      },
      {
        "name": "บางปลาม้า",
        "subDistricts": [
          {
            "name": "โคกคราม",
            "postalCode": "72150"
          },
          {
            "name": "บางปลาม้า",
            "postalCode": "72150"
          },
          {
            "name": "ตะค่า",
            "postalCode": "72150"
          },
          {
            "name": "บางใหญ่",
            "postalCode": "72150"
          },
          {
            "name": "กฤษณา",
            "postalCode": "72150"
          },
          {
            "name": "สาลี",
            "postalCode": "72150"
          },
          {
            "name": "ไผ่กองดิน",
            "postalCode": "72150"
          },
          {
            "name": "องครักษ์",
            "postalCode": "72150"
          },
          {
            "name": "จรเข้ใหญ่",
            "postalCode": "72150"
          },
          {
            "name": "บ้านแหลม",
            "postalCode": "72150"
          },
          {
            "name": "มะขามล้ม",
            "postalCode": "72150"
          },
          {
            "name": "วังน้ำเย็น",
            "postalCode": "72150"
          },
          {
            "name": "วัดโบสถ์",
            "postalCode": "72150"
          },
          {
            "name": "วัดดาว",
            "postalCode": "72150"
          }
        ]
      },
      {
        "name": "ศรีประจันต์",
        "subDistricts": [
          {
            "name": "ศรีประจันต์",
            "postalCode": "72140"
          },
          {
            "name": "บ้านกร่าง",
            "postalCode": "72140"
          },
          {
            "name": "มดแดง",
            "postalCode": "72140"
          },
          {
            "name": "บางงาม",
            "postalCode": "72140"
          },
          {
            "name": "ดอนปรู",
            "postalCode": "72140"
          },
          {
            "name": "ปลายนา",
            "postalCode": "72140"
          },
          {
            "name": "วังหว้า",
            "postalCode": "72140"
          },
          {
            "name": "วังน้ำซับ",
            "postalCode": "72140"
          },
          {
            "name": "วังยาง",
            "postalCode": "72140"
          }
        ]
      },
      {
        "name": "ดอนเจดีย์",
        "subDistricts": [
          {
            "name": "ดอนเจดีย์",
            "postalCode": "72170"
          },
          {
            "name": "หนองสาหร่าย",
            "postalCode": "72170"
          },
          {
            "name": "ไร่รถ",
            "postalCode": "72170"
          },
          {
            "name": "สระกระโจม",
            "postalCode": "72250"
          },
          {
            "name": "ทะเลบก",
            "postalCode": "72250"
          }
        ]
      },
      {
        "name": "สองพี่น้อง",
        "subDistricts": [
          {
            "name": "สองพี่น้อง",
            "postalCode": "72110"
          },
          {
            "name": "บางเลน",
            "postalCode": "72110"
          },
          {
            "name": "บางตาเถร",
            "postalCode": "72110"
          },
          {
            "name": "บางตะเคียน",
            "postalCode": "72110"
          },
          {
            "name": "บ้านกุ่ม",
            "postalCode": "72110"
          },
          {
            "name": "หัวโพธิ์",
            "postalCode": "72110"
          },
          {
            "name": "บางพลับ",
            "postalCode": "72110"
          },
          {
            "name": "เนินพระปรางค์",
            "postalCode": "72110"
          },
          {
            "name": "บ้านช้าง",
            "postalCode": "72110"
          },
          {
            "name": "ต้นตาล",
            "postalCode": "72110"
          },
          {
            "name": "ศรีสำราญ",
            "postalCode": "72110"
          },
          {
            "name": "ทุ่งคอก",
            "postalCode": "72190"
          },
          {
            "name": "หนองบ่อ",
            "postalCode": "72110"
          },
          {
            "name": "บ่อสุพรรณ",
            "postalCode": "72190"
          },
          {
            "name": "ดอนมะนาว",
            "postalCode": "72110"
          }
        ]
      },
      {
        "name": "สามชุก",
        "subDistricts": [
          {
            "name": "ย่านยาว",
            "postalCode": "72130"
          },
          {
            "name": "วังลึก",
            "postalCode": "72130"
          },
          {
            "name": "สามชุก",
            "postalCode": "72130"
          },
          {
            "name": "หนองผักนาก",
            "postalCode": "72130"
          },
          {
            "name": "บ้านสระ",
            "postalCode": "72130"
          },
          {
            "name": "หนองสะเดา",
            "postalCode": "72130"
          },
          {
            "name": "กระเสียว",
            "postalCode": "72130"
          }
        ]
      },
      {
        "name": "อู่ทอง",
        "subDistricts": [
          {
            "name": "อู่ทอง",
            "postalCode": "72160"
          },
          {
            "name": "สระยายโสม",
            "postalCode": "72220"
          },
          {
            "name": "จรเข้สามพัน",
            "postalCode": "72160"
          },
          {
            "name": "บ้านดอน",
            "postalCode": "72160"
          },
          {
            "name": "ยุ้งทะลาย",
            "postalCode": "72160"
          },
          {
            "name": "ดอนมะเกลือ",
            "postalCode": "72220"
          },
          {
            "name": "หนองโอ่ง",
            "postalCode": "72160"
          },
          {
            "name": "ดอนคา",
            "postalCode": "72160"
          },
          {
            "name": "พลับพลาไชย",
            "postalCode": "72160"
          },
          {
            "name": "บ้านโข้ง",
            "postalCode": "72160"
          },
          {
            "name": "เจดีย์",
            "postalCode": "72160"
          },
          {
            "name": "สระพังลาน",
            "postalCode": "72220"
          },
          {
            "name": "กระจัน",
            "postalCode": "72160"
          }
        ]
      },
      {
        "name": "หนองหญ้าไซ",
        "subDistricts": [
          {
            "name": "หนองหญ้าไซ",
            "postalCode": "72240"
          },
          {
            "name": "หนองราชวัตร",
            "postalCode": "72240"
          },
          {
            "name": "หนองโพธิ์",
            "postalCode": "72240"
          },
          {
            "name": "แจงงาม",
            "postalCode": "72240"
          },
          {
            "name": "หนองขาม",
            "postalCode": "72240"
          },
          {
            "name": "ทัพหลวง",
            "postalCode": "72240"
          }
        ]
      }
    ]
  },
  {
    "name": "นครปฐม",
    "districts": [
      {
        "name": "เมืองนครปฐม",
        "subDistricts": [
          {
            "name": "พระปฐมเจดีย์",
            "postalCode": "73000"
          },
          {
            "name": "บางแขม",
            "postalCode": "73000"
          },
          {
            "name": "พระประโทน",
            "postalCode": "73000"
          },
          {
            "name": "ธรรมศาลา",
            "postalCode": "73000"
          },
          {
            "name": "ตาก้อง",
            "postalCode": "73000"
          },
          {
            "name": "มาบแค",
            "postalCode": "73000"
          },
          {
            "name": "สนามจันทร์",
            "postalCode": "73000"
          },
          {
            "name": "ดอนยายหอม",
            "postalCode": "73000"
          },
          {
            "name": "ถนนขาด",
            "postalCode": "73000"
          },
          {
            "name": "บ่อพลับ",
            "postalCode": "73000"
          },
          {
            "name": "นครปฐม",
            "postalCode": "73000"
          },
          {
            "name": "วังตะกู",
            "postalCode": "73000"
          },
          {
            "name": "หนองปากโลง",
            "postalCode": "73000"
          },
          {
            "name": "สามควายเผือก",
            "postalCode": "73000"
          },
          {
            "name": "ทุ่งน้อย",
            "postalCode": "73000"
          },
          {
            "name": "หนองดินแดง",
            "postalCode": "73000"
          },
          {
            "name": "วังเย็น",
            "postalCode": "73000"
          },
          {
            "name": "โพรงมะเดื่อ",
            "postalCode": "73000"
          },
          {
            "name": "ลำพยา",
            "postalCode": "73000"
          },
          {
            "name": "สระกะเทียม",
            "postalCode": "73000"
          },
          {
            "name": "สวนป่าน",
            "postalCode": "73000"
          },
          {
            "name": "ห้วยจรเข้",
            "postalCode": "73000"
          },
          {
            "name": "ทัพหลวง",
            "postalCode": "73000"
          },
          {
            "name": "หนองงูเหลือม",
            "postalCode": "73000"
          },
          {
            "name": "บ้านยาง",
            "postalCode": "73000"
          }
        ]
      },
      {
        "name": "กำแพงแสน",
        "subDistricts": [
          {
            "name": "ทุ่งกระพังโหม",
            "postalCode": "73140"
          },
          {
            "name": "กระตีบ",
            "postalCode": "73180"
          },
          {
            "name": "ทุ่งลูกนก",
            "postalCode": "73140"
          },
          {
            "name": "ห้วยขวาง",
            "postalCode": "73140"
          },
          {
            "name": "ทุ่งขวาง",
            "postalCode": "73140"
          },
          {
            "name": "สระสี่มุม",
            "postalCode": "73140"
          },
          {
            "name": "ทุ่งบัว",
            "postalCode": "73140"
          },
          {
            "name": "ดอนข่อย",
            "postalCode": "73140"
          },
          {
            "name": "สระพัฒนา",
            "postalCode": "73180"
          },
          {
            "name": "ห้วยหมอนทอง",
            "postalCode": "73140"
          },
          {
            "name": "ห้วยม่วง",
            "postalCode": "73180"
          },
          {
            "name": "กำแพงแสน",
            "postalCode": "73140"
          },
          {
            "name": "รางพิกุล",
            "postalCode": "73140"
          },
          {
            "name": "หนองกระทุ่ม",
            "postalCode": "73140"
          },
          {
            "name": "วังน้ำเขียว",
            "postalCode": "73140"
          }
        ]
      },
      {
        "name": "นครชัยศรี",
        "subDistricts": [
          {
            "name": "นครชัยศรี",
            "postalCode": "73120"
          },
          {
            "name": "บางกระเบา",
            "postalCode": "73120"
          },
          {
            "name": "วัดแค",
            "postalCode": "73120"
          },
          {
            "name": "ท่าตำหนัก",
            "postalCode": "73120"
          },
          {
            "name": "บางแก้ว",
            "postalCode": "73120"
          },
          {
            "name": "ท่ากระชับ",
            "postalCode": "73120"
          },
          {
            "name": "ขุนแก้ว",
            "postalCode": "73120"
          },
          {
            "name": "ท่าพระยา",
            "postalCode": "73120"
          },
          {
            "name": "พะเนียด",
            "postalCode": "73120"
          },
          {
            "name": "บางระกำ",
            "postalCode": "73120"
          },
          {
            "name": "โคกพระเจดีย์",
            "postalCode": "73120"
          },
          {
            "name": "ศรีษะทอง",
            "postalCode": "73120"
          },
          {
            "name": "แหลมบัว",
            "postalCode": "73120"
          },
          {
            "name": "ศรีมหาโพธิ์",
            "postalCode": "73120"
          },
          {
            "name": "สัมปทวน",
            "postalCode": "73120"
          },
          {
            "name": "วัดสำโรง",
            "postalCode": "73120"
          },
          {
            "name": "ดอนแฝก",
            "postalCode": "73120"
          },
          {
            "name": "ห้วยพลู",
            "postalCode": "73120"
          },
          {
            "name": "วัดละมุด",
            "postalCode": "73120"
          },
          {
            "name": "บางพระ",
            "postalCode": "73120"
          },
          {
            "name": "บางแก้วฟ้า",
            "postalCode": "73120"
          },
          {
            "name": "ลานตากฟ้า",
            "postalCode": "73120"
          },
          {
            "name": "งิ้วราย",
            "postalCode": "73120"
          },
          {
            "name": "ไทยาวาส",
            "postalCode": "73120"
          }
        ]
      },
      {
        "name": "ดอนตูม",
        "subDistricts": [
          {
            "name": "สามง่าม",
            "postalCode": "73150"
          },
          {
            "name": "ห้วยพระ",
            "postalCode": "73150"
          },
          {
            "name": "ลำเหย",
            "postalCode": "73150"
          },
          {
            "name": "ดอนพุทรา",
            "postalCode": "73150"
          },
          {
            "name": "บ้านหลวง",
            "postalCode": "73150"
          },
          {
            "name": "ดอนรวก",
            "postalCode": "73150"
          },
          {
            "name": "ห้วยด้วน",
            "postalCode": "73150"
          },
          {
            "name": "ลำลูกบัว",
            "postalCode": "73150"
          }
        ]
      },
      {
        "name": "บางเลน",
        "subDistricts": [
          {
            "name": "บางเลน",
            "postalCode": "73130"
          },
          {
            "name": "บางปลา",
            "postalCode": "73130"
          },
          {
            "name": "บางหลวง",
            "postalCode": "73190"
          },
          {
            "name": "บางภาษี",
            "postalCode": "73130"
          },
          {
            "name": "บางระกำ",
            "postalCode": "73130"
          },
          {
            "name": "บางไทรป่า",
            "postalCode": "73130"
          },
          {
            "name": "หินมูล",
            "postalCode": "73190"
          },
          {
            "name": "ไทรงาม",
            "postalCode": "73130"
          },
          {
            "name": "ดอนตูม",
            "postalCode": "73130"
          },
          {
            "name": "นิลเพชร",
            "postalCode": "73130"
          },
          {
            "name": "บัวปากท่า",
            "postalCode": "73130"
          },
          {
            "name": "คลองนกกระทุง",
            "postalCode": "73130"
          },
          {
            "name": "นราภิรมย์",
            "postalCode": "73130"
          },
          {
            "name": "ลำพญา",
            "postalCode": "73130"
          },
          {
            "name": "ไผ่หูช้าง",
            "postalCode": "73130"
          }
        ]
      },
      {
        "name": "สามพราน",
        "subDistricts": [
          {
            "name": "ท่าข้าม",
            "postalCode": "73110"
          },
          {
            "name": "ทรงคนอง",
            "postalCode": "73210"
          },
          {
            "name": "หอมเกร็ด",
            "postalCode": "73110"
          },
          {
            "name": "บางกระทึก",
            "postalCode": "73210"
          },
          {
            "name": "บางเตย",
            "postalCode": "73210"
          },
          {
            "name": "สามพราน",
            "postalCode": "73110"
          },
          {
            "name": "บางช้าง",
            "postalCode": "73110"
          },
          {
            "name": "ไร่ขิง",
            "postalCode": "73210"
          },
          {
            "name": "ท่าตลาด",
            "postalCode": "73110"
          },
          {
            "name": "กระทุ่มล้ม",
            "postalCode": "73220"
          },
          {
            "name": "คลองใหม่",
            "postalCode": "73110"
          },
          {
            "name": "ตลาดจินดา",
            "postalCode": "73110"
          },
          {
            "name": "คลองจินดา",
            "postalCode": "73110"
          },
          {
            "name": "ยายชา",
            "postalCode": "73110"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "73110"
          },
          {
            "name": "อ้อมใหญ่",
            "postalCode": "73160"
          }
        ]
      },
      {
        "name": "พุทธมณฑล",
        "subDistricts": [
          {
            "name": "ศาลายา",
            "postalCode": "73170"
          },
          {
            "name": "คลองโยง",
            "postalCode": "73170"
          },
          {
            "name": "มหาสวัสดิ์",
            "postalCode": "73170"
          }
        ]
      }
    ]
  },
  {
    "name": "สมุทรสาคร",
    "districts": [
      {
        "name": "เมืองสมุทรสาคร",
        "subDistricts": [
          {
            "name": "มหาชัย",
            "postalCode": "74000"
          },
          {
            "name": "ท่าฉลอม",
            "postalCode": "74000"
          },
          {
            "name": "โกรกกราก",
            "postalCode": "74000"
          },
          {
            "name": "บ้านบ่อ",
            "postalCode": "74000"
          },
          {
            "name": "บางโทรัด",
            "postalCode": "74000"
          },
          {
            "name": "กาหลง",
            "postalCode": "74000"
          },
          {
            "name": "นาโคก",
            "postalCode": "74000"
          },
          {
            "name": "ท่าจีน",
            "postalCode": "74000"
          },
          {
            "name": "นาดี",
            "postalCode": "74000"
          },
          {
            "name": "ท่าทราย",
            "postalCode": "74000"
          },
          {
            "name": "คอกกระบือ",
            "postalCode": "74000"
          },
          {
            "name": "บางน้ำจืด",
            "postalCode": "74000"
          },
          {
            "name": "พันท้ายนรสิงห์",
            "postalCode": "74000"
          },
          {
            "name": "โคกขาม",
            "postalCode": "74000"
          },
          {
            "name": "บ้านเกาะ",
            "postalCode": "74000"
          },
          {
            "name": "บางกระเจ้า",
            "postalCode": "74000"
          },
          {
            "name": "บางหญ้าแพรก",
            "postalCode": "74000"
          },
          {
            "name": "ชัยมงคล",
            "postalCode": "74000"
          }
        ]
      },
      {
        "name": "กระทุ่มแบน",
        "subDistricts": [
          {
            "name": "ตลาดกระทุ่มแบน",
            "postalCode": "74110"
          },
          {
            "name": "อ้อมน้อย",
            "postalCode": "74130"
          },
          {
            "name": "ท่าไม้",
            "postalCode": "74110"
          },
          {
            "name": "สวนหลวง",
            "postalCode": "74110"
          },
          {
            "name": "บางยาง",
            "postalCode": "74110"
          },
          {
            "name": "คลองมะเดื่อ",
            "postalCode": "74110"
          },
          {
            "name": "หนองนกไข่",
            "postalCode": "74110"
          },
          {
            "name": "ดอนไก่ดี",
            "postalCode": "74110"
          },
          {
            "name": "แคราย",
            "postalCode": "74110"
          },
          {
            "name": "ท่าเสา",
            "postalCode": "74110"
          }
        ]
      },
      {
        "name": "บ้านแพ้ว",
        "subDistricts": [
          {
            "name": "บ้านแพ้ว",
            "postalCode": "74120"
          },
          {
            "name": "หลักสาม",
            "postalCode": "74120"
          },
          {
            "name": "ยกกระบัตร",
            "postalCode": "74120"
          },
          {
            "name": "โรงเข้",
            "postalCode": "74120"
          },
          {
            "name": "หนองสองห้อง",
            "postalCode": "74120"
          },
          {
            "name": "หนองบัว",
            "postalCode": "74120"
          },
          {
            "name": "หลักสอง",
            "postalCode": "74120"
          },
          {
            "name": "เจ็ดริ้ว",
            "postalCode": "74120"
          },
          {
            "name": "คลองตัน",
            "postalCode": "74120"
          },
          {
            "name": "อำแพง",
            "postalCode": "74120"
          },
          {
            "name": "สวนส้ม",
            "postalCode": "74120"
          },
          {
            "name": "เกษตรพัฒนา",
            "postalCode": "74120"
          }
        ]
      }
    ]
  },
  {
    "name": "สมุทรสงคราม",
    "districts": [
      {
        "name": "เมืองสมุทรสงคราม",
        "subDistricts": [
          {
            "name": "แม่กลอง",
            "postalCode": "75000"
          },
          {
            "name": "บางขันแตก",
            "postalCode": "75000"
          },
          {
            "name": "ลาดใหญ่",
            "postalCode": "75000"
          },
          {
            "name": "บ้านปรก",
            "postalCode": "75000"
          },
          {
            "name": "บางแก้ว",
            "postalCode": "75000"
          },
          {
            "name": "ท้ายหาด",
            "postalCode": "75000"
          },
          {
            "name": "แหลมใหญ่",
            "postalCode": "75000"
          },
          {
            "name": "คลองเขิน",
            "postalCode": "75000"
          },
          {
            "name": "คลองโคน",
            "postalCode": "75000"
          },
          {
            "name": "นางตะเคียน",
            "postalCode": "75000"
          },
          {
            "name": "บางจะเกร็ง",
            "postalCode": "75000"
          }
        ]
      },
      {
        "name": "บางคนที",
        "subDistricts": [
          {
            "name": "กระดังงา",
            "postalCode": "75120"
          },
          {
            "name": "บางสะแก",
            "postalCode": "75120"
          },
          {
            "name": "บางยี่รงค์",
            "postalCode": "75120"
          },
          {
            "name": "โรงหีบ",
            "postalCode": "75120"
          },
          {
            "name": "บางคนที",
            "postalCode": "75120"
          },
          {
            "name": "ดอนมะโนรา",
            "postalCode": "75120"
          },
          {
            "name": "บางพรม",
            "postalCode": "75120"
          },
          {
            "name": "บางกุ้ง",
            "postalCode": "75120"
          },
          {
            "name": "จอมปลวก",
            "postalCode": "75120"
          },
          {
            "name": "บางนกแขวก",
            "postalCode": "75120"
          },
          {
            "name": "ยายแพง",
            "postalCode": "75120"
          },
          {
            "name": "บางกระบือ",
            "postalCode": "75120"
          },
          {
            "name": "บ้านปราโมทย์",
            "postalCode": "75120"
          }
        ]
      },
      {
        "name": "อัมพวา",
        "subDistricts": [
          {
            "name": "อัมพวา",
            "postalCode": "75110"
          },
          {
            "name": "สวนหลวง",
            "postalCode": "75110"
          },
          {
            "name": "ท่าคา",
            "postalCode": "75110"
          },
          {
            "name": "วัดประดู่",
            "postalCode": "75110"
          },
          {
            "name": "เหมืองใหม่",
            "postalCode": "75110"
          },
          {
            "name": "บางช้าง",
            "postalCode": "75110"
          },
          {
            "name": "แควอ้อม",
            "postalCode": "75110"
          },
          {
            "name": "ปลายโพงพาง",
            "postalCode": "75110"
          },
          {
            "name": "บางแค",
            "postalCode": "75110"
          },
          {
            "name": "แพรกหนามแดง",
            "postalCode": "75110"
          },
          {
            "name": "ยี่สาร",
            "postalCode": "75110"
          },
          {
            "name": "บางนางลี่",
            "postalCode": "75110"
          }
        ]
      }
    ]
  },
  {
    "name": "เพชรบุรี",
    "districts": [
      {
        "name": "เมืองเพชรบุรี",
        "subDistricts": [
          {
            "name": "ท่าราบ",
            "postalCode": "76000"
          },
          {
            "name": "คลองกระแชง",
            "postalCode": "76000"
          },
          {
            "name": "บางจาน",
            "postalCode": "76000"
          },
          {
            "name": "นาพันสาม",
            "postalCode": "76000"
          },
          {
            "name": "ธงชัย",
            "postalCode": "76000"
          },
          {
            "name": "บ้านกุ่ม",
            "postalCode": "76000"
          },
          {
            "name": "หนองโสน",
            "postalCode": "76000"
          },
          {
            "name": "ไร่ส้ม",
            "postalCode": "76000"
          },
          {
            "name": "เวียงคอย",
            "postalCode": "76000"
          },
          {
            "name": "บางจาก",
            "postalCode": "76000"
          },
          {
            "name": "บ้านหม้อ",
            "postalCode": "76000"
          },
          {
            "name": "ต้นมะม่วง",
            "postalCode": "76000"
          },
          {
            "name": "ช่องสะแก",
            "postalCode": "76000"
          },
          {
            "name": "นาวุ้ง",
            "postalCode": "76000"
          },
          {
            "name": "สำมะโรง",
            "postalCode": "76000"
          },
          {
            "name": "โพพระ",
            "postalCode": "76000"
          },
          {
            "name": "หาดเจ้าสำราญ",
            "postalCode": "76100"
          },
          {
            "name": "หัวสะพาน",
            "postalCode": "76000"
          },
          {
            "name": "ต้นมะพร้าว",
            "postalCode": "76000"
          },
          {
            "name": "วังตะโก",
            "postalCode": "76000"
          },
          {
            "name": "โพไร่หวาน",
            "postalCode": "76000"
          },
          {
            "name": "ดอนยาง",
            "postalCode": "76000"
          },
          {
            "name": "หนองขนาน",
            "postalCode": "76000"
          },
          {
            "name": "หนองพลับ",
            "postalCode": "76000"
          }
        ]
      },
      {
        "name": "เขาย้อย",
        "subDistricts": [
          {
            "name": "เขาย้อย",
            "postalCode": "76140"
          },
          {
            "name": "สระพัง",
            "postalCode": "76140"
          },
          {
            "name": "บางเค็ม",
            "postalCode": "76140"
          },
          {
            "name": "ทับคาง",
            "postalCode": "76140"
          },
          {
            "name": "หนองปลาไหล",
            "postalCode": "76140"
          },
          {
            "name": "หนองปรง",
            "postalCode": "76140"
          },
          {
            "name": "หนองชุมพล",
            "postalCode": "76140"
          },
          {
            "name": "ห้วยโรง",
            "postalCode": "76140"
          },
          {
            "name": "ห้วยท่าช้าง",
            "postalCode": "76140"
          },
          {
            "name": "หนองชุมพลเหนือ",
            "postalCode": "76140"
          }
        ]
      },
      {
        "name": "หนองหญ้าปล้อง",
        "subDistricts": [
          {
            "name": "หนองหญ้าปล้อง",
            "postalCode": "76160"
          },
          {
            "name": "ยางน้ำกลัดเหนือ",
            "postalCode": "76160"
          },
          {
            "name": "ยางน้ำกลัดใต้",
            "postalCode": "76160"
          },
          {
            "name": "ท่าตะคร้อ",
            "postalCode": "76160"
          }
        ]
      },
      {
        "name": "ชะอำ",
        "subDistricts": [
          {
            "name": "ชะอำ",
            "postalCode": "76120"
          },
          {
            "name": "บางเก่า",
            "postalCode": "76120"
          },
          {
            "name": "นายาง",
            "postalCode": "76120"
          },
          {
            "name": "เขาใหญ่",
            "postalCode": "76120"
          },
          {
            "name": "หนองศาลา",
            "postalCode": "76120"
          },
          {
            "name": "ห้วยทรายเหนือ",
            "postalCode": "76120"
          },
          {
            "name": "ไร่ใหม่พัฒนา",
            "postalCode": "76120"
          },
          {
            "name": "สามพระยา",
            "postalCode": "76120"
          },
          {
            "name": "ดอนขุนห้วย",
            "postalCode": "76120"
          }
        ]
      },
      {
        "name": "ท่ายาง",
        "subDistricts": [
          {
            "name": "ท่ายาง",
            "postalCode": "76130"
          },
          {
            "name": "ท่าคอย",
            "postalCode": "76130"
          },
          {
            "name": "ยางหย่อง",
            "postalCode": "76130"
          },
          {
            "name": "หนองจอก",
            "postalCode": "76130"
          },
          {
            "name": "มาบปลาเค้า",
            "postalCode": "76130"
          },
          {
            "name": "ท่าไม้รวก",
            "postalCode": "76130"
          },
          {
            "name": "วังไคร้",
            "postalCode": "76130"
          },
          {
            "name": "กลัดหลวง",
            "postalCode": "76130"
          },
          {
            "name": "ปึกเตียน",
            "postalCode": "76130"
          },
          {
            "name": "เขากระปุก",
            "postalCode": "76130"
          },
          {
            "name": "ท่าแลง",
            "postalCode": "76130"
          },
          {
            "name": "บ้านในดง",
            "postalCode": "76130"
          }
        ]
      },
      {
        "name": "บ้านลาด",
        "subDistricts": [
          {
            "name": "บ้านลาด",
            "postalCode": "76150"
          },
          {
            "name": "บ้านหาด",
            "postalCode": "76150"
          },
          {
            "name": "บ้านทาน",
            "postalCode": "76150"
          },
          {
            "name": "ตำหรุ",
            "postalCode": "76150"
          },
          {
            "name": "สมอพลือ",
            "postalCode": "76150"
          },
          {
            "name": "ไร่มะขาม",
            "postalCode": "76150"
          },
          {
            "name": "ท่าเสน",
            "postalCode": "76150"
          },
          {
            "name": "หนองกระเจ็ด",
            "postalCode": "76150"
          },
          {
            "name": "หนองกะปุ",
            "postalCode": "76150"
          },
          {
            "name": "ลาดโพธิ์",
            "postalCode": "76150"
          },
          {
            "name": "สะพานไกร",
            "postalCode": "76150"
          },
          {
            "name": "ไร่โคก",
            "postalCode": "76150"
          },
          {
            "name": "โรงเข้",
            "postalCode": "76150"
          },
          {
            "name": "ไร่สะท้อน",
            "postalCode": "76150"
          },
          {
            "name": "ห้วยข้อง",
            "postalCode": "76150"
          },
          {
            "name": "ท่าช้าง",
            "postalCode": "76150"
          },
          {
            "name": "ถ้ำรงค์",
            "postalCode": "76150"
          },
          {
            "name": "ห้วยลึก",
            "postalCode": "76150"
          }
        ]
      },
      {
        "name": "บ้านแหลม",
        "subDistricts": [
          {
            "name": "บ้านแหลม",
            "postalCode": "76110"
          },
          {
            "name": "บางขุนไทร",
            "postalCode": "76110"
          },
          {
            "name": "ปากทะเล",
            "postalCode": "76110"
          },
          {
            "name": "บางแก้ว",
            "postalCode": "76110"
          },
          {
            "name": "แหลมผักเบี้ย",
            "postalCode": "76100"
          },
          {
            "name": "บางตะบูน",
            "postalCode": "76110"
          },
          {
            "name": "บางตะบูนออก",
            "postalCode": "76110"
          },
          {
            "name": "บางครก",
            "postalCode": "76110"
          },
          {
            "name": "ท่าแร้ง",
            "postalCode": "76110"
          },
          {
            "name": "ท่าแร้งออก",
            "postalCode": "76110"
          }
        ]
      },
      {
        "name": "แก่งกระจาน",
        "subDistricts": [
          {
            "name": "แก่งกระจาน",
            "postalCode": "76170"
          },
          {
            "name": "สองพี่น้อง",
            "postalCode": "76170"
          },
          {
            "name": "วังจันทร์",
            "postalCode": "76170"
          },
          {
            "name": "ป่าเด็ง",
            "postalCode": "76170"
          },
          {
            "name": "พุสวรรค์",
            "postalCode": "76170"
          },
          {
            "name": "ห้วยแม่เพรียง",
            "postalCode": "76170"
          }
        ]
      }
    ]
  },
  {
    "name": "ประจวบคีรีขันธ์",
    "districts": [
      {
        "name": "เมืองประจวบคีรีขันธ์",
        "subDistricts": [
          {
            "name": "ประจวบคีรีขันธ์",
            "postalCode": "77000"
          },
          {
            "name": "เกาะหลัก",
            "postalCode": "77000"
          },
          {
            "name": "คลองวาฬ",
            "postalCode": "77000"
          },
          {
            "name": "ห้วยทราย",
            "postalCode": "77000"
          },
          {
            "name": "อ่าวน้อย",
            "postalCode": "77000"
          },
          {
            "name": "บ่อนอก",
            "postalCode": "77210"
          }
        ]
      },
      {
        "name": "กุยบุรี",
        "subDistricts": [
          {
            "name": "กุยบุรี",
            "postalCode": "77150"
          },
          {
            "name": "กุยเหนือ",
            "postalCode": "77150"
          },
          {
            "name": "เขาแดง",
            "postalCode": "77150"
          },
          {
            "name": "ดอนยายหนู",
            "postalCode": "77150"
          },
          {
            "name": "สามกระทาย",
            "postalCode": "77150"
          },
          {
            "name": "หาดขาม",
            "postalCode": "77150"
          }
        ]
      },
      {
        "name": "ทับสะแก",
        "subDistricts": [
          {
            "name": "ทับสะแก",
            "postalCode": "77130"
          },
          {
            "name": "อ่างทอง",
            "postalCode": "77130"
          },
          {
            "name": "นาหูกวาง",
            "postalCode": "77130"
          },
          {
            "name": "เขาล้าน",
            "postalCode": "77130"
          },
          {
            "name": "ห้วยยาง",
            "postalCode": "77130"
          },
          {
            "name": "แสงอรุณ",
            "postalCode": "77130"
          }
        ]
      },
      {
        "name": "บางสะพาน",
        "subDistricts": [
          {
            "name": "กำเนิดนพคุณ",
            "postalCode": "77140"
          },
          {
            "name": "พงศ์ประศาสน์",
            "postalCode": "77140"
          },
          {
            "name": "ร่อนทอง",
            "postalCode": "77230"
          },
          {
            "name": "ธงชัย",
            "postalCode": "77190"
          },
          {
            "name": "ชัยเกษม",
            "postalCode": "77190"
          },
          {
            "name": "ทองมงคล",
            "postalCode": "77230"
          },
          {
            "name": "แม่รำพึง",
            "postalCode": "77140"
          }
        ]
      },
      {
        "name": "บางสะพานน้อย",
        "subDistricts": [
          {
            "name": "ปากแพรก",
            "postalCode": "77170"
          },
          {
            "name": "บางสะพาน",
            "postalCode": "77170"
          },
          {
            "name": "ทรายทอง",
            "postalCode": "77170"
          },
          {
            "name": "ช้างแรก",
            "postalCode": "77170"
          },
          {
            "name": "ไชยราช",
            "postalCode": "77170"
          }
        ]
      },
      {
        "name": "ปราณบุรี",
        "subDistricts": [
          {
            "name": "ปราณบุรี",
            "postalCode": "77120"
          },
          {
            "name": "เขาน้อย",
            "postalCode": "77120"
          },
          {
            "name": "ปากน้ำปราณ",
            "postalCode": "77220"
          },
          {
            "name": "หนองตาแต้ม",
            "postalCode": "77120"
          },
          {
            "name": "วังก์พง",
            "postalCode": "77120"
          },
          {
            "name": "เขาจ้าว",
            "postalCode": "77120"
          }
        ]
      },
      {
        "name": "หัวหิน",
        "subDistricts": [
          {
            "name": "หัวหิน",
            "postalCode": "77110"
          },
          {
            "name": "หนองแก",
            "postalCode": "77110"
          },
          {
            "name": "หินเหล็กไฟ",
            "postalCode": "77110"
          },
          {
            "name": "หนองพลับ",
            "postalCode": "77110"
          },
          {
            "name": "ทับใต้",
            "postalCode": "77110"
          },
          {
            "name": "ห้วยสัตว์ใหญ่",
            "postalCode": "77110"
          },
          {
            "name": "บึงนคร",
            "postalCode": "77110"
          }
        ]
      },
      {
        "name": "สามร้อยยอด",
        "subDistricts": [
          {
            "name": "สามร้อยยอด",
            "postalCode": "77120"
          },
          {
            "name": "ศิลาลอย",
            "postalCode": "77180"
          },
          {
            "name": "ไร่เก่า",
            "postalCode": "77180"
          },
          {
            "name": "ศาลาลัย",
            "postalCode": "77180"
          },
          {
            "name": "ไร่ใหม่",
            "postalCode": "77180"
          }
        ]
      }
    ]
  },
  {
    "name": "นครศรีธรรมราช",
    "districts": [
      {
        "name": "เมืองนครศรีธรรมราช",
        "subDistricts": [
          {
            "name": "ในเมือง",
            "postalCode": "80000"
          },
          {
            "name": "ท่าวัง",
            "postalCode": "80000"
          },
          {
            "name": "คลัง",
            "postalCode": "80000"
          },
          {
            "name": "ท่าไร่",
            "postalCode": "80000"
          },
          {
            "name": "ปากนคร",
            "postalCode": "80000"
          },
          {
            "name": "นาทราย",
            "postalCode": "80280"
          },
          {
            "name": "กำแพงเซา",
            "postalCode": "80280"
          },
          {
            "name": "ไชยมนตรี",
            "postalCode": "80000"
          },
          {
            "name": "มะม่วงสองต้น",
            "postalCode": "80000"
          },
          {
            "name": "นาเคียน",
            "postalCode": "80000"
          },
          {
            "name": "ท่างิ้ว",
            "postalCode": "80280"
          },
          {
            "name": "โพธิ์เสด็จ",
            "postalCode": "80000"
          },
          {
            "name": "บางจาก",
            "postalCode": "80330"
          },
          {
            "name": "ปากพูน",
            "postalCode": "80000"
          },
          {
            "name": "ท่าซัก",
            "postalCode": "80000"
          },
          {
            "name": "ท่าเรือ",
            "postalCode": "80290"
          }
        ]
      },
      {
        "name": "พรหมคีรี",
        "subDistricts": [
          {
            "name": "พรหมโลก",
            "postalCode": "80320"
          },
          {
            "name": "บ้านเกาะ",
            "postalCode": "80320"
          },
          {
            "name": "อินคีรี",
            "postalCode": "80320"
          },
          {
            "name": "ทอนหงส์",
            "postalCode": "80320"
          },
          {
            "name": "นาเรียง",
            "postalCode": "80320"
          }
        ]
      },
      {
        "name": "ลานสกา",
        "subDistricts": [
          {
            "name": "เขาแก้ว",
            "postalCode": "80230"
          },
          {
            "name": "ลานสกา",
            "postalCode": "80230"
          },
          {
            "name": "ท่าดี",
            "postalCode": "80230"
          },
          {
            "name": "กำโลน",
            "postalCode": "80230"
          },
          {
            "name": "ขุนทะเล",
            "postalCode": "80230"
          }
        ]
      },
      {
        "name": "ฉวาง",
        "subDistricts": [
          {
            "name": "ฉวาง",
            "postalCode": "80150"
          },
          {
            "name": "ละอาย",
            "postalCode": "80250"
          },
          {
            "name": "นาแว",
            "postalCode": "80260"
          },
          {
            "name": "ไม้เรียง",
            "postalCode": "80150"
          },
          {
            "name": "กะเปียด",
            "postalCode": "80260"
          },
          {
            "name": "นากะชะ",
            "postalCode": "80150"
          },
          {
            "name": "ห้วยปริก",
            "postalCode": "80260"
          },
          {
            "name": "ไสหร้า",
            "postalCode": "80150"
          },
          {
            "name": "นาเขลียง",
            "postalCode": "80260"
          },
          {
            "name": "จันดี",
            "postalCode": "80250"
          }
        ]
      },
      {
        "name": "พิปูน",
        "subDistricts": [
          {
            "name": "พิปูน",
            "postalCode": "80270"
          },
          {
            "name": "กะทูน",
            "postalCode": "80270"
          },
          {
            "name": "เขาพระ",
            "postalCode": "80270"
          },
          {
            "name": "ยางค้อม",
            "postalCode": "80270"
          },
          {
            "name": "ควนกลาง",
            "postalCode": "80270"
          }
        ]
      },
      {
        "name": "เชียรใหญ่",
        "subDistricts": [
          {
            "name": "เชียรใหญ่",
            "postalCode": "80190"
          },
          {
            "name": "ท่าขนาน",
            "postalCode": "80190"
          },
          {
            "name": "บ้านกลาง",
            "postalCode": "80190"
          },
          {
            "name": "บ้านเนิน",
            "postalCode": "80190"
          },
          {
            "name": "ไสหมาก",
            "postalCode": "80190"
          },
          {
            "name": "ท้องลำเจียก",
            "postalCode": "80190"
          },
          {
            "name": "เสือหึง",
            "postalCode": "80190"
          },
          {
            "name": "การะเกด",
            "postalCode": "80190"
          },
          {
            "name": "เขาพระบาท",
            "postalCode": "80190"
          },
          {
            "name": "แม่เจ้าอยู่หัว",
            "postalCode": "80190"
          }
        ]
      },
      {
        "name": "ชะอวด",
        "subDistricts": [
          {
            "name": "ชะอวด",
            "postalCode": "80180"
          },
          {
            "name": "ท่าเสม็ด",
            "postalCode": "80180"
          },
          {
            "name": "ท่าประจะ",
            "postalCode": "80180"
          },
          {
            "name": "เคร็ง",
            "postalCode": "80180"
          },
          {
            "name": "วังอ่าง",
            "postalCode": "80180"
          },
          {
            "name": "บ้านตูล",
            "postalCode": "80180"
          },
          {
            "name": "ขอนหาด",
            "postalCode": "80180"
          },
          {
            "name": "เกาะขันธ์",
            "postalCode": "80180"
          },
          {
            "name": "ควนหนองหงษ์",
            "postalCode": "80180"
          },
          {
            "name": "เขาพระทอง",
            "postalCode": "80180"
          },
          {
            "name": "นางหลง",
            "postalCode": "80180"
          }
        ]
      },
      {
        "name": "ท่าศาลา",
        "subDistricts": [
          {
            "name": "ท่าศาลา",
            "postalCode": "80160"
          },
          {
            "name": "กลาย",
            "postalCode": "80160"
          },
          {
            "name": "ท่าขึ้น",
            "postalCode": "80160"
          },
          {
            "name": "หัวตะพาน",
            "postalCode": "80160"
          },
          {
            "name": "สระแก้ว",
            "postalCode": "80160"
          },
          {
            "name": "โมคลาน",
            "postalCode": "80160"
          },
          {
            "name": "ไทยบุรี",
            "postalCode": "80160"
          },
          {
            "name": "ดอนตะโก",
            "postalCode": "80160"
          },
          {
            "name": "ตลิ่งชัน",
            "postalCode": "80160"
          },
          {
            "name": "โพธิ์ทอง",
            "postalCode": "80160"
          }
        ]
      },
      {
        "name": "ทุ่งสง",
        "subDistricts": [
          {
            "name": "ปากแพรก",
            "postalCode": "80110"
          },
          {
            "name": "ชะมาย",
            "postalCode": "80110"
          },
          {
            "name": "หนองหงส์",
            "postalCode": "80110"
          },
          {
            "name": "ควนกรด",
            "postalCode": "80110"
          },
          {
            "name": "นาไม้ไผ่",
            "postalCode": "80110"
          },
          {
            "name": "นาหลวงเสน",
            "postalCode": "80110"
          },
          {
            "name": "เขาโร",
            "postalCode": "80110"
          },
          {
            "name": "กะปาง",
            "postalCode": "80310"
          },
          {
            "name": "ที่วัง",
            "postalCode": "80110"
          },
          {
            "name": "น้ำตก",
            "postalCode": "80110"
          },
          {
            "name": "ถ้ำใหญ่",
            "postalCode": "80110"
          },
          {
            "name": "นาโพธิ์",
            "postalCode": "80110"
          },
          {
            "name": "เขาขาว",
            "postalCode": "80110"
          }
        ]
      },
      {
        "name": "นาบอน",
        "subDistricts": [
          {
            "name": "นาบอน",
            "postalCode": "80220"
          },
          {
            "name": "ทุ่งสง",
            "postalCode": "80220"
          },
          {
            "name": "แก้วแสน",
            "postalCode": "80220"
          }
        ]
      },
      {
        "name": "ทุ่งใหญ่",
        "subDistricts": [
          {
            "name": "ท่ายาง",
            "postalCode": "80240"
          },
          {
            "name": "ทุ่งสัง",
            "postalCode": "80240"
          },
          {
            "name": "ทุ่งใหญ่",
            "postalCode": "80240"
          },
          {
            "name": "กุแหระ",
            "postalCode": "80240"
          },
          {
            "name": "ปริก",
            "postalCode": "80240"
          },
          {
            "name": "บางรูป",
            "postalCode": "80240"
          },
          {
            "name": "กรุงหยัน",
            "postalCode": "80240"
          }
        ]
      },
      {
        "name": "ปากพนัง",
        "subDistricts": [
          {
            "name": "ปากพนัง",
            "postalCode": "80140"
          },
          {
            "name": "คลองน้อย",
            "postalCode": "80330"
          },
          {
            "name": "ป่าระกำ",
            "postalCode": "80140"
          },
          {
            "name": "ชะเมา",
            "postalCode": "80330"
          },
          {
            "name": "คลองกระบือ",
            "postalCode": "80140"
          },
          {
            "name": "เกาะทวด",
            "postalCode": "80330"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "80140"
          },
          {
            "name": "หูล่อง",
            "postalCode": "80140"
          },
          {
            "name": "แหลมตะลุมพุก",
            "postalCode": "80140"
          },
          {
            "name": "ปากพนังฝั่งตะวันตก",
            "postalCode": "80140"
          },
          {
            "name": "บางศาลา",
            "postalCode": "80140"
          },
          {
            "name": "บางพระ",
            "postalCode": "80140"
          },
          {
            "name": "บางตะพง",
            "postalCode": "80140"
          },
          {
            "name": "ปากพนังฝั่งตะวันออก",
            "postalCode": "80140"
          },
          {
            "name": "บ้านเพิง",
            "postalCode": "80140"
          },
          {
            "name": "ท่าพยา",
            "postalCode": "80140"
          },
          {
            "name": "ปากแพรก",
            "postalCode": "80140"
          },
          {
            "name": "ขนาบนาก",
            "postalCode": "80140"
          }
        ]
      },
      {
        "name": "ร่อนพิบูลย์",
        "subDistricts": [
          {
            "name": "ร่อนพิบูลย์",
            "postalCode": "80130"
          },
          {
            "name": "หินตก",
            "postalCode": "80350"
          },
          {
            "name": "เสาธง",
            "postalCode": "80350"
          },
          {
            "name": "ควนเกย",
            "postalCode": "80130"
          },
          {
            "name": "ควนพัง",
            "postalCode": "80130"
          },
          {
            "name": "ควนชุม",
            "postalCode": "80130"
          }
        ]
      },
      {
        "name": "สิชล",
        "subDistricts": [
          {
            "name": "สิชล",
            "postalCode": "80120"
          },
          {
            "name": "ทุ่งปรัง",
            "postalCode": "80120"
          },
          {
            "name": "ฉลอง",
            "postalCode": "80120"
          },
          {
            "name": "เสาเภา",
            "postalCode": "80340"
          },
          {
            "name": "เปลี่ยน",
            "postalCode": "80120"
          },
          {
            "name": "สี่ขีด",
            "postalCode": "80120"
          },
          {
            "name": "เทพราช",
            "postalCode": "80340"
          },
          {
            "name": "เขาน้อย",
            "postalCode": "80120"
          },
          {
            "name": "ทุ่งใส",
            "postalCode": "80120"
          }
        ]
      },
      {
        "name": "ขนอม",
        "subDistricts": [
          {
            "name": "ขนอม",
            "postalCode": "80210"
          },
          {
            "name": "ควนทอง",
            "postalCode": "80210"
          },
          {
            "name": "ท้องเนียน",
            "postalCode": "80210"
          }
        ]
      },
      {
        "name": "หัวไทร",
        "subDistricts": [
          {
            "name": "หัวไทร",
            "postalCode": "80170"
          },
          {
            "name": "หน้าสตน",
            "postalCode": "80170"
          },
          {
            "name": "ทรายขาว",
            "postalCode": "80170"
          },
          {
            "name": "แหลม",
            "postalCode": "80170"
          },
          {
            "name": "เขาพังไกร",
            "postalCode": "80170"
          },
          {
            "name": "บ้านราม",
            "postalCode": "80170"
          },
          {
            "name": "บางนบ",
            "postalCode": "80170"
          },
          {
            "name": "ท่าซอม",
            "postalCode": "80170"
          },
          {
            "name": "ควนชะลิก",
            "postalCode": "80170"
          },
          {
            "name": "รามแก้ว",
            "postalCode": "80170"
          },
          {
            "name": "เกาะเพชร",
            "postalCode": "80170"
          }
        ]
      },
      {
        "name": "บางขัน",
        "subDistricts": [
          {
            "name": "บางขัน",
            "postalCode": "80360"
          },
          {
            "name": "บ้านลำนาว",
            "postalCode": "80360"
          },
          {
            "name": "วังหิน",
            "postalCode": "80360"
          },
          {
            "name": "บ้านนิคม",
            "postalCode": "80360"
          }
        ]
      },
      {
        "name": "ถ้ำพรรณรา",
        "subDistricts": [
          {
            "name": "ถ้ำพรรณรา",
            "postalCode": "80260"
          },
          {
            "name": "คลองเส",
            "postalCode": "80260"
          },
          {
            "name": "ดุสิต",
            "postalCode": "80260"
          }
        ]
      },
      {
        "name": "จุฬาภรณ์",
        "subDistricts": [
          {
            "name": "บ้านควนมุด",
            "postalCode": "80180"
          },
          {
            "name": "บ้านชะอวด",
            "postalCode": "80180"
          },
          {
            "name": "ควนหนองคว้า",
            "postalCode": "80130"
          },
          {
            "name": "ทุ่งโพธิ์",
            "postalCode": "80130"
          },
          {
            "name": "นาหมอบุญ",
            "postalCode": "80130"
          },
          {
            "name": "สามตำบล",
            "postalCode": "80130"
          }
        ]
      },
      {
        "name": "พระพรหม",
        "subDistricts": [
          {
            "name": "นาพรุ",
            "postalCode": "80000"
          },
          {
            "name": "นาสาร",
            "postalCode": "80000"
          },
          {
            "name": "ท้ายสำเภา",
            "postalCode": "80000"
          },
          {
            "name": "ช้างซ้าย",
            "postalCode": "80000"
          }
        ]
      },
      {
        "name": "นบพิตำ",
        "subDistricts": [
          {
            "name": "นบพิตำ",
            "postalCode": "80160"
          },
          {
            "name": "กรุงชิง",
            "postalCode": "80160"
          },
          {
            "name": "กะหรอ",
            "postalCode": "80160"
          },
          {
            "name": "นาเหรง",
            "postalCode": "80160"
          }
        ]
      },
      {
        "name": "ช้างกลาง",
        "subDistricts": [
          {
            "name": "ช้างกลาง",
            "postalCode": "80250"
          },
          {
            "name": "หลักช้าง",
            "postalCode": "80250"
          },
          {
            "name": "สวนขัน",
            "postalCode": "80250"
          }
        ]
      },
      {
        "name": "เฉลิมพระเกียรติ",
        "subDistricts": [
          {
            "name": "เชียรเขา",
            "postalCode": "80190"
          },
          {
            "name": "ดอนตรอ",
            "postalCode": "80290"
          },
          {
            "name": "สวนหลวง",
            "postalCode": "80190"
          },
          {
            "name": "ทางพูน",
            "postalCode": "80190"
          }
        ]
      }
    ]
  },
  {
    "name": "กระบี่",
    "districts": [
      {
        "name": "เมืองกระบี่",
        "subDistricts": [
          {
            "name": "ปากน้ำ",
            "postalCode": "81000"
          },
          {
            "name": "กระบี่ใหญ่",
            "postalCode": "81000"
          },
          {
            "name": "กระบี่น้อย",
            "postalCode": "81000"
          },
          {
            "name": "เขาคราม",
            "postalCode": "81000"
          },
          {
            "name": "เขาทอง",
            "postalCode": "81000"
          },
          {
            "name": "ทับปริก",
            "postalCode": "81000"
          },
          {
            "name": "ไสไทย",
            "postalCode": "81000"
          },
          {
            "name": "อ่าวนาง",
            "postalCode": "81000"
          },
          {
            "name": "หนองทะเล",
            "postalCode": "81000"
          },
          {
            "name": "คลองประสงค์",
            "postalCode": "81000"
          }
        ]
      },
      {
        "name": "เขาพนม",
        "subDistricts": [
          {
            "name": "เขาพนม",
            "postalCode": "81140"
          },
          {
            "name": "เขาดิน",
            "postalCode": "81140"
          },
          {
            "name": "สินปุน",
            "postalCode": "80240"
          },
          {
            "name": "พรุเตียว",
            "postalCode": "81140"
          },
          {
            "name": "หน้าเขา",
            "postalCode": "81140"
          },
          {
            "name": "โคกหาร",
            "postalCode": "80240"
          }
        ]
      },
      {
        "name": "เกาะลันตา",
        "subDistricts": [
          {
            "name": "เกาะลันตาใหญ่",
            "postalCode": "81150"
          },
          {
            "name": "เกาะลันตาน้อย",
            "postalCode": "81150"
          },
          {
            "name": "เกาะกลาง",
            "postalCode": "81120"
          },
          {
            "name": "คลองยาง",
            "postalCode": "81120"
          },
          {
            "name": "ศาลาด่าน",
            "postalCode": "81150"
          }
        ]
      },
      {
        "name": "คลองท่อม",
        "subDistricts": [
          {
            "name": "คลองท่อมใต้",
            "postalCode": "81120"
          },
          {
            "name": "คลองท่อมเหนือ",
            "postalCode": "81120"
          },
          {
            "name": "คลองพน",
            "postalCode": "81170"
          },
          {
            "name": "ทรายขาว",
            "postalCode": "81170"
          },
          {
            "name": "ห้วยน้ำขาว",
            "postalCode": "81120"
          },
          {
            "name": "พรุดินนา",
            "postalCode": "81120"
          },
          {
            "name": "เพหลา",
            "postalCode": "81120"
          }
        ]
      },
      {
        "name": "อ่าวลึก",
        "subDistricts": [
          {
            "name": "อ่าวลึกใต้",
            "postalCode": "81110"
          },
          {
            "name": "แหลมสัก",
            "postalCode": "81110"
          },
          {
            "name": "นาเหนือ",
            "postalCode": "81110"
          },
          {
            "name": "คลองหิน",
            "postalCode": "81110"
          },
          {
            "name": "อ่าวลึกน้อย",
            "postalCode": "81110"
          },
          {
            "name": "อ่าวลึกเหนือ",
            "postalCode": "81110"
          },
          {
            "name": "เขาใหญ่",
            "postalCode": "81110"
          },
          {
            "name": "คลองยา",
            "postalCode": "81110"
          },
          {
            "name": "บ้านกลาง",
            "postalCode": "81110"
          }
        ]
      },
      {
        "name": "ปลายพระยา",
        "subDistricts": [
          {
            "name": "ปลายพระยา",
            "postalCode": "81160"
          },
          {
            "name": "เขาเขน",
            "postalCode": "81160"
          },
          {
            "name": "เขาต่อ",
            "postalCode": "81160"
          },
          {
            "name": "คีรีวง",
            "postalCode": "81160"
          }
        ]
      },
      {
        "name": "ลำทับ",
        "subDistricts": [
          {
            "name": "ลำทับ",
            "postalCode": "81120"
          },
          {
            "name": "ดินอุดม",
            "postalCode": "81120"
          },
          {
            "name": "ทุ่งไทรทอง",
            "postalCode": "81120"
          },
          {
            "name": "ดินแดง",
            "postalCode": "81120"
          }
        ]
      },
      {
        "name": "เหนือคลอง",
        "subDistricts": [
          {
            "name": "เหนือคลอง",
            "postalCode": "81130"
          },
          {
            "name": "เกาะศรีบอยา",
            "postalCode": "81130"
          },
          {
            "name": "คลองขนาน",
            "postalCode": "81130"
          },
          {
            "name": "คลองเขม้า",
            "postalCode": "81130"
          },
          {
            "name": "โคกยาง",
            "postalCode": "81130"
          },
          {
            "name": "ตลิ่งชัน",
            "postalCode": "81130"
          },
          {
            "name": "ปกาสัย",
            "postalCode": "81130"
          },
          {
            "name": "ห้วยยูง",
            "postalCode": "81130"
          }
        ]
      }
    ]
  },
  {
    "name": "พังงา",
    "districts": [
      {
        "name": "เมืองพังงา",
        "subDistricts": [
          {
            "name": "ท้ายช้าง",
            "postalCode": "82000"
          },
          {
            "name": "นบปริง",
            "postalCode": "82000"
          },
          {
            "name": "ถ้ำน้ำผุด",
            "postalCode": "82000"
          },
          {
            "name": "บางเตย",
            "postalCode": "82000"
          },
          {
            "name": "ตากแดด",
            "postalCode": "82000"
          },
          {
            "name": "สองแพรก",
            "postalCode": "82000"
          },
          {
            "name": "ทุ่งคาโงก",
            "postalCode": "82000"
          },
          {
            "name": "เกาะปันหยี",
            "postalCode": "82000"
          },
          {
            "name": "ป่ากอ",
            "postalCode": "82000"
          }
        ]
      },
      {
        "name": "เกาะยาว",
        "subDistricts": [
          {
            "name": "เกาะยาวน้อย",
            "postalCode": "82160"
          },
          {
            "name": "เกาะยาวใหญ่",
            "postalCode": "82160"
          },
          {
            "name": "พรุใน",
            "postalCode": "83000"
          }
        ]
      },
      {
        "name": "กะปง",
        "subDistricts": [
          {
            "name": "กะปง",
            "postalCode": "82170"
          },
          {
            "name": "ท่านา",
            "postalCode": "82170"
          },
          {
            "name": "เหมาะ",
            "postalCode": "82170"
          },
          {
            "name": "เหล",
            "postalCode": "82170"
          },
          {
            "name": "รมณีย์",
            "postalCode": "82170"
          }
        ]
      },
      {
        "name": "ตะกั่วทุ่ง",
        "subDistricts": [
          {
            "name": "ถ้ำ",
            "postalCode": "82130"
          },
          {
            "name": "กระโสม",
            "postalCode": "82130"
          },
          {
            "name": "กะไหล",
            "postalCode": "82130"
          },
          {
            "name": "ท่าอยู่",
            "postalCode": "82130"
          },
          {
            "name": "หล่อยูง",
            "postalCode": "82140"
          },
          {
            "name": "โคกกลอย",
            "postalCode": "82140"
          },
          {
            "name": "คลองเคียน",
            "postalCode": "82130"
          }
        ]
      },
      {
        "name": "ตะกั่วป่า",
        "subDistricts": [
          {
            "name": "ตะกั่วป่า",
            "postalCode": "82110"
          },
          {
            "name": "บางนายสี",
            "postalCode": "82110"
          },
          {
            "name": "บางไทร",
            "postalCode": "82110"
          },
          {
            "name": "บางม่วง",
            "postalCode": "82110"
          },
          {
            "name": "ตำตัว",
            "postalCode": "82110"
          },
          {
            "name": "โคกเคียน",
            "postalCode": "82110"
          },
          {
            "name": "คึกคัก",
            "postalCode": "82190"
          },
          {
            "name": "เกาะคอเขา",
            "postalCode": "82190"
          }
        ]
      },
      {
        "name": "คุระบุรี",
        "subDistricts": [
          {
            "name": "คุระ",
            "postalCode": "82150"
          },
          {
            "name": "บางวัน",
            "postalCode": "82150"
          },
          {
            "name": "เกาะพระทอง",
            "postalCode": "82150"
          },
          {
            "name": "แม่นางขาว",
            "postalCode": "82150"
          }
        ]
      },
      {
        "name": "ทับปุด",
        "subDistricts": [
          {
            "name": "ทับปุด",
            "postalCode": "82180"
          },
          {
            "name": "มะรุ่ย",
            "postalCode": "82180"
          },
          {
            "name": "บ่อแสน",
            "postalCode": "82180"
          },
          {
            "name": "ถ้ำทองหลาง",
            "postalCode": "82180"
          },
          {
            "name": "โคกเจริญ",
            "postalCode": "82180"
          },
          {
            "name": "บางเหรียง",
            "postalCode": "82180"
          }
        ]
      },
      {
        "name": "ท้ายเหมือง",
        "subDistricts": [
          {
            "name": "ท้ายเหมือง",
            "postalCode": "82120"
          },
          {
            "name": "นาเตย",
            "postalCode": "82120"
          },
          {
            "name": "บางทอง",
            "postalCode": "82120"
          },
          {
            "name": "ทุ่งมะพร้าว",
            "postalCode": "82120"
          },
          {
            "name": "ลำภี",
            "postalCode": "82120"
          },
          {
            "name": "ลำแก่น",
            "postalCode": "82120"
          }
        ]
      }
    ]
  },
  {
    "name": "ภูเก็ต",
    "districts": [
      {
        "name": "เมืองภูเก็ต",
        "subDistricts": [
          {
            "name": "ตลาดใหญ่",
            "postalCode": "83000"
          },
          {
            "name": "ตลาดเหนือ",
            "postalCode": "83000"
          },
          {
            "name": "เกาะแก้ว",
            "postalCode": "83000"
          },
          {
            "name": "รัษฎา",
            "postalCode": "83000"
          },
          {
            "name": "วิชิต",
            "postalCode": "83000"
          },
          {
            "name": "ฉลอง",
            "postalCode": "83130"
          },
          {
            "name": "ราไวย์",
            "postalCode": "83130"
          },
          {
            "name": "กะรน",
            "postalCode": "83100"
          }
        ]
      },
      {
        "name": "กะทู้",
        "subDistricts": [
          {
            "name": "กะทู้",
            "postalCode": "83120"
          },
          {
            "name": "ป่าตอง",
            "postalCode": "83150"
          },
          {
            "name": "กมลา",
            "postalCode": "83150"
          }
        ]
      },
      {
        "name": "ถลาง",
        "subDistricts": [
          {
            "name": "เทพกระษัตรี",
            "postalCode": "83110"
          },
          {
            "name": "ศรีสุนทร",
            "postalCode": "83110"
          },
          {
            "name": "เชิงทะเล",
            "postalCode": "83110"
          },
          {
            "name": "ป่าคลอก",
            "postalCode": "83110"
          },
          {
            "name": "ไม้ขาว",
            "postalCode": "83110"
          },
          {
            "name": "สาคู",
            "postalCode": "83110"
          }
        ]
      }
    ]
  },
  {
    "name": "สุราษฎร์ธานี",
    "districts": [
      {
        "name": "เมืองสุราษฎร์ธานี",
        "subDistricts": [
          {
            "name": "ตลาด",
            "postalCode": "84000"
          },
          {
            "name": "มะขามเตี้ย",
            "postalCode": "84000"
          },
          {
            "name": "วัดประดู่",
            "postalCode": "84000"
          },
          {
            "name": "ขุนทะเล",
            "postalCode": "84100"
          },
          {
            "name": "บางใบไม้",
            "postalCode": "84000"
          },
          {
            "name": "บางชนะ",
            "postalCode": "84000"
          },
          {
            "name": "คลองน้อย",
            "postalCode": "84000"
          },
          {
            "name": "บางไทร",
            "postalCode": "84000"
          },
          {
            "name": "บางโพธิ์",
            "postalCode": "84000"
          },
          {
            "name": "บางกุ้ง",
            "postalCode": "84000"
          },
          {
            "name": "คลองฉนาก",
            "postalCode": "84000"
          }
        ]
      },
      {
        "name": "กาญจนดิษฐ์",
        "subDistricts": [
          {
            "name": "ท่าทองใหม่",
            "postalCode": "84290"
          },
          {
            "name": "ท่าทอง",
            "postalCode": "84160"
          },
          {
            "name": "กะแดะ",
            "postalCode": "84160"
          },
          {
            "name": "ทุ่งกง",
            "postalCode": "84290"
          },
          {
            "name": "กรูด",
            "postalCode": "84160"
          },
          {
            "name": "ช้างซ้าย",
            "postalCode": "84160"
          },
          {
            "name": "พลายวาส",
            "postalCode": "84160"
          },
          {
            "name": "ป่าร่อน",
            "postalCode": "84160"
          },
          {
            "name": "ตะเคียนทอง",
            "postalCode": "84160"
          },
          {
            "name": "ช้างขวา",
            "postalCode": "84160"
          },
          {
            "name": "ท่าอุแท",
            "postalCode": "84160"
          },
          {
            "name": "ทุ่งรัง",
            "postalCode": "84290"
          },
          {
            "name": "คลองสระ",
            "postalCode": "84160"
          }
        ]
      },
      {
        "name": "ดอนสัก",
        "subDistricts": [
          {
            "name": "ดอนสัก",
            "postalCode": "84220"
          },
          {
            "name": "ชลคราม",
            "postalCode": "84160"
          },
          {
            "name": "ไชยคราม",
            "postalCode": "84220"
          },
          {
            "name": "ปากแพรก",
            "postalCode": "84340"
          }
        ]
      },
      {
        "name": "เกาะสมุย",
        "subDistricts": [
          {
            "name": "อ่างทอง",
            "postalCode": "84140"
          },
          {
            "name": "ลิปะน้อย",
            "postalCode": "84140"
          },
          {
            "name": "ตลิ่งงาม",
            "postalCode": "84140"
          },
          {
            "name": "หน้าเมือง",
            "postalCode": "84140"
          },
          {
            "name": "มะเร็ต",
            "postalCode": "84310"
          },
          {
            "name": "บ่อผุด",
            "postalCode": "84320"
          },
          {
            "name": "แม่น้ำ",
            "postalCode": "84330"
          }
        ]
      },
      {
        "name": "เกาะพะงัน",
        "subDistricts": [
          {
            "name": "เกาะพะงัน",
            "postalCode": "84280"
          },
          {
            "name": "บ้านใต้",
            "postalCode": "84280"
          },
          {
            "name": "เกาะเต่า",
            "postalCode": "84280"
          }
        ]
      },
      {
        "name": "ไชยา",
        "subDistricts": [
          {
            "name": "ตลาดไชยา",
            "postalCode": "84110"
          },
          {
            "name": "พุมเรียง",
            "postalCode": "84110"
          },
          {
            "name": "เลม็ด",
            "postalCode": "84110"
          },
          {
            "name": "เวียง",
            "postalCode": "84110"
          },
          {
            "name": "ทุ่ง",
            "postalCode": "84110"
          },
          {
            "name": "ป่าเว",
            "postalCode": "84110"
          },
          {
            "name": "ตะกรบ",
            "postalCode": "84110"
          },
          {
            "name": "โมถ่าย",
            "postalCode": "84110"
          },
          {
            "name": "ปากหมาก",
            "postalCode": "84110"
          }
        ]
      },
      {
        "name": "ท่าชนะ",
        "subDistricts": [
          {
            "name": "ท่าชนะ",
            "postalCode": "84170"
          },
          {
            "name": "สมอทอง",
            "postalCode": "84170"
          },
          {
            "name": "ประสงค์",
            "postalCode": "84170"
          },
          {
            "name": "คันธุลี",
            "postalCode": "84170"
          },
          {
            "name": "วัง",
            "postalCode": "84170"
          },
          {
            "name": "คลองพา",
            "postalCode": "84170"
          }
        ]
      },
      {
        "name": "คีรีรัฐนิคม",
        "subDistricts": [
          {
            "name": "ท่าขนอน",
            "postalCode": "84180"
          },
          {
            "name": "บ้านยาง",
            "postalCode": "84180"
          },
          {
            "name": "น้ำหัก",
            "postalCode": "84180"
          },
          {
            "name": "กะเปา",
            "postalCode": "84180"
          },
          {
            "name": "ท่ากระดาน",
            "postalCode": "84180"
          },
          {
            "name": "ย่านยาว",
            "postalCode": "84180"
          },
          {
            "name": "ถ้ำสิงขร",
            "postalCode": "84180"
          },
          {
            "name": "บ้านทำเนียบ",
            "postalCode": "84180"
          }
        ]
      },
      {
        "name": "บ้านตาขุน",
        "subDistricts": [
          {
            "name": "เขาวง",
            "postalCode": "84230"
          },
          {
            "name": "พระแสง",
            "postalCode": "84230"
          },
          {
            "name": "พรุไทย",
            "postalCode": "84230"
          },
          {
            "name": "เขาพัง",
            "postalCode": "84230"
          }
        ]
      },
      {
        "name": "พนม",
        "subDistricts": [
          {
            "name": "พนม",
            "postalCode": "84250"
          },
          {
            "name": "ต้นยวน",
            "postalCode": "84250"
          },
          {
            "name": "คลองศก",
            "postalCode": "84250"
          },
          {
            "name": "พลูเถื่อน",
            "postalCode": "84250"
          },
          {
            "name": "พังกาญจน์",
            "postalCode": "84250"
          },
          {
            "name": "คลองชะอุ่น",
            "postalCode": "84250"
          }
        ]
      },
      {
        "name": "ท่าฉาง",
        "subDistricts": [
          {
            "name": "ท่าฉาง",
            "postalCode": "84150"
          },
          {
            "name": "ท่าเคย",
            "postalCode": "84150"
          },
          {
            "name": "คลองไทร",
            "postalCode": "84150"
          },
          {
            "name": "เขาถ่าน",
            "postalCode": "84150"
          },
          {
            "name": "เสวียด",
            "postalCode": "84150"
          },
          {
            "name": "ปากฉลุย",
            "postalCode": "84150"
          }
        ]
      },
      {
        "name": "บ้านนาสาร",
        "subDistricts": [
          {
            "name": "นาสาร",
            "postalCode": "84120"
          },
          {
            "name": "พรุพี",
            "postalCode": "84270"
          },
          {
            "name": "ทุ่งเตา",
            "postalCode": "84120"
          },
          {
            "name": "ลำพูน",
            "postalCode": "84120"
          },
          {
            "name": "ท่าชี",
            "postalCode": "84120"
          },
          {
            "name": "ควนศรี",
            "postalCode": "84270"
          },
          {
            "name": "ควนสุบรรณ",
            "postalCode": "84120"
          },
          {
            "name": "คลองปราบ",
            "postalCode": "84120"
          },
          {
            "name": "น้ำพุ",
            "postalCode": "84120"
          },
          {
            "name": "ทุ่งเตาใหม่",
            "postalCode": "84120"
          },
          {
            "name": "เพิ่มพูนทรัพย์",
            "postalCode": "84120"
          }
        ]
      },
      {
        "name": "บ้านนาเดิม",
        "subDistricts": [
          {
            "name": "บ้านนา",
            "postalCode": "84240"
          },
          {
            "name": "ท่าเรือ",
            "postalCode": "84240"
          },
          {
            "name": "ทรัพย์ทวี",
            "postalCode": "84240"
          },
          {
            "name": "นาใต้",
            "postalCode": "84240"
          }
        ]
      },
      {
        "name": "เคียนซา",
        "subDistricts": [
          {
            "name": "เคียนซา",
            "postalCode": "84260"
          },
          {
            "name": "พ่วงพรมคร",
            "postalCode": "84210"
          },
          {
            "name": "เขาตอก",
            "postalCode": "84260"
          },
          {
            "name": "อรัญคามวารี",
            "postalCode": "84260"
          },
          {
            "name": "บ้านเสด็จ",
            "postalCode": "84260"
          }
        ]
      },
      {
        "name": "เวียงสระ",
        "subDistricts": [
          {
            "name": "เวียงสระ",
            "postalCode": "84190"
          },
          {
            "name": "บ้านส้อง",
            "postalCode": "84190"
          },
          {
            "name": "คลองฉนวน",
            "postalCode": "84190"
          },
          {
            "name": "ทุ่งหลวง",
            "postalCode": "84190"
          },
          {
            "name": "เขานิพันธ์",
            "postalCode": "84190"
          }
        ]
      },
      {
        "name": "พระแสง",
        "subDistricts": [
          {
            "name": "อิปัน",
            "postalCode": "84210"
          },
          {
            "name": "สินปุน",
            "postalCode": "84210"
          },
          {
            "name": "บางสวรรค์",
            "postalCode": "84210"
          },
          {
            "name": "ไทรขึง",
            "postalCode": "84210"
          },
          {
            "name": "สินเจริญ",
            "postalCode": "84210"
          },
          {
            "name": "ไทรโสภา",
            "postalCode": "84210"
          },
          {
            "name": "สาคู",
            "postalCode": "84210"
          }
        ]
      },
      {
        "name": "พุนพิน",
        "subDistricts": [
          {
            "name": "ท่าข้าม",
            "postalCode": "84130"
          },
          {
            "name": "ท่าสะท้อน",
            "postalCode": "84130"
          },
          {
            "name": "ลีเล็ด",
            "postalCode": "84130"
          },
          {
            "name": "บางมะเดื่อ",
            "postalCode": "84130"
          },
          {
            "name": "บางเดือน",
            "postalCode": "84130"
          },
          {
            "name": "ท่าโรงช้าง",
            "postalCode": "84130"
          },
          {
            "name": "กรูด",
            "postalCode": "84130"
          },
          {
            "name": "พุนพิน",
            "postalCode": "84130"
          },
          {
            "name": "บางงอน",
            "postalCode": "84130"
          },
          {
            "name": "ศรีวิชัย",
            "postalCode": "84130"
          },
          {
            "name": "น้ำรอบ",
            "postalCode": "84130"
          },
          {
            "name": "มะลวน",
            "postalCode": "84130"
          },
          {
            "name": "หัวเตย",
            "postalCode": "84130"
          },
          {
            "name": "หนองไทร",
            "postalCode": "84130"
          },
          {
            "name": "เขาหัวควาย",
            "postalCode": "84130"
          },
          {
            "name": "ตะปาน",
            "postalCode": "84130"
          }
        ]
      },
      {
        "name": "ชัยบุรี",
        "subDistricts": [
          {
            "name": "สองแพรก",
            "postalCode": "84350"
          },
          {
            "name": "ชัยบุรี",
            "postalCode": "84350"
          },
          {
            "name": "คลองน้อย",
            "postalCode": "84350"
          },
          {
            "name": "ไทรทอง",
            "postalCode": "84350"
          }
        ]
      },
      {
        "name": "วิภาวดี",
        "subDistricts": [
          {
            "name": "ตะกุกใต้",
            "postalCode": "84180"
          },
          {
            "name": "ตะกุกเหนือ",
            "postalCode": "84180"
          }
        ]
      }
    ]
  },
  {
    "name": "ระนอง",
    "districts": [
      {
        "name": "เมืองระนอง",
        "subDistricts": [
          {
            "name": "เขานิเวศน์",
            "postalCode": "85000"
          },
          {
            "name": "ราชกรูด",
            "postalCode": "85000"
          },
          {
            "name": "หงาว",
            "postalCode": "85000"
          },
          {
            "name": "บางริ้น",
            "postalCode": "85000"
          },
          {
            "name": "ปากน้ำ",
            "postalCode": "85000"
          },
          {
            "name": "บางนอน",
            "postalCode": "85000"
          },
          {
            "name": "หาดส้มแป้น",
            "postalCode": "85000"
          },
          {
            "name": "ทรายแดง",
            "postalCode": "85130"
          },
          {
            "name": "เกาะพยาม",
            "postalCode": "85000"
          }
        ]
      },
      {
        "name": "ละอุ่น",
        "subDistricts": [
          {
            "name": "ละอุ่นใต้",
            "postalCode": "85130"
          },
          {
            "name": "ละอุ่นเหนือ",
            "postalCode": "85130"
          },
          {
            "name": "บางพระใต้",
            "postalCode": "85130"
          },
          {
            "name": "บางพระเหนือ",
            "postalCode": "85130"
          },
          {
            "name": "บางแก้ว",
            "postalCode": "85130"
          },
          {
            "name": "ในวงเหนือ",
            "postalCode": "85130"
          },
          {
            "name": "ในวงใต้",
            "postalCode": "85130"
          }
        ]
      },
      {
        "name": "กะเปอร์",
        "subDistricts": [
          {
            "name": "ม่วงกลวง",
            "postalCode": "85120"
          },
          {
            "name": "กะเปอร์",
            "postalCode": "85120"
          },
          {
            "name": "เชี่ยวเหลียง",
            "postalCode": "85120"
          },
          {
            "name": "บ้านนา",
            "postalCode": "85120"
          },
          {
            "name": "บางหิน",
            "postalCode": "85120"
          }
        ]
      },
      {
        "name": "กระบุรี",
        "subDistricts": [
          {
            "name": "น้ำจืด",
            "postalCode": "85110"
          },
          {
            "name": "น้ำจืดน้อย",
            "postalCode": "85110"
          },
          {
            "name": "มะมุ",
            "postalCode": "85110"
          },
          {
            "name": "ปากจั่น",
            "postalCode": "85110"
          },
          {
            "name": "ลำเลียง",
            "postalCode": "85110"
          },
          {
            "name": "จ.ป.ร.",
            "postalCode": "85110"
          },
          {
            "name": "บางใหญ่",
            "postalCode": "85110"
          }
        ]
      },
      {
        "name": "สุขสำราญ",
        "subDistricts": [
          {
            "name": "นาคา",
            "postalCode": "85120"
          },
          {
            "name": "กำพวน",
            "postalCode": "85120"
          }
        ]
      }
    ]
  },
  {
    "name": "ชุมพร",
    "districts": [
      {
        "name": "เมืองชุมพร",
        "subDistricts": [
          {
            "name": "ท่าตะเภา",
            "postalCode": "86000"
          },
          {
            "name": "ปากน้ำ",
            "postalCode": "86120"
          },
          {
            "name": "ท่ายาง",
            "postalCode": "86000"
          },
          {
            "name": "บางหมาก",
            "postalCode": "86000"
          },
          {
            "name": "นาทุ่ง",
            "postalCode": "86000"
          },
          {
            "name": "นาชะอัง",
            "postalCode": "86000"
          },
          {
            "name": "ตากแดด",
            "postalCode": "86000"
          },
          {
            "name": "บางลึก",
            "postalCode": "86000"
          },
          {
            "name": "หาดพันไกร",
            "postalCode": "86000"
          },
          {
            "name": "วังไผ่",
            "postalCode": "86000"
          },
          {
            "name": "วังใหม่",
            "postalCode": "86190"
          },
          {
            "name": "บ้านนา",
            "postalCode": "86190"
          },
          {
            "name": "ขุนกระทิง",
            "postalCode": "86000"
          },
          {
            "name": "ทุ่งคา",
            "postalCode": "86100"
          },
          {
            "name": "วิสัยเหนือ",
            "postalCode": "86100"
          },
          {
            "name": "หาดทรายรี",
            "postalCode": "86120"
          },
          {
            "name": "ถ้ำสิงห์",
            "postalCode": "86100"
          }
        ]
      },
      {
        "name": "ท่าแซะ",
        "subDistricts": [
          {
            "name": "ท่าแซะ",
            "postalCode": "86140"
          },
          {
            "name": "คุริง",
            "postalCode": "86140"
          },
          {
            "name": "สลุย",
            "postalCode": "86140"
          },
          {
            "name": "นากระตาม",
            "postalCode": "86140"
          },
          {
            "name": "รับร่อ",
            "postalCode": "86190"
          },
          {
            "name": "ท่าข้าม",
            "postalCode": "86140"
          },
          {
            "name": "หงษ์เจริญ",
            "postalCode": "86140"
          },
          {
            "name": "หินแก้ว",
            "postalCode": "86190"
          },
          {
            "name": "ทรัพย์อนันต์",
            "postalCode": "86140"
          },
          {
            "name": "สองพี่น้อง",
            "postalCode": "86140"
          }
        ]
      },
      {
        "name": "ปะทิว",
        "subDistricts": [
          {
            "name": "บางสน",
            "postalCode": "86160"
          },
          {
            "name": "ทะเลทรัพย์",
            "postalCode": "86160"
          },
          {
            "name": "สะพลี",
            "postalCode": "86230"
          },
          {
            "name": "ชุมโค",
            "postalCode": "86160"
          },
          {
            "name": "ดอนยาง",
            "postalCode": "86210"
          },
          {
            "name": "ปากคลอง",
            "postalCode": "86210"
          },
          {
            "name": "เขาไชยราช",
            "postalCode": "86210"
          }
        ]
      },
      {
        "name": "หลังสวน",
        "subDistricts": [
          {
            "name": "หลังสวน",
            "postalCode": "86110"
          },
          {
            "name": "ขันเงิน",
            "postalCode": "86110"
          },
          {
            "name": "ท่ามะพลา",
            "postalCode": "86110"
          },
          {
            "name": "นาขา",
            "postalCode": "86110"
          },
          {
            "name": "นาพญา",
            "postalCode": "86110"
          },
          {
            "name": "บ้านควน",
            "postalCode": "86110"
          },
          {
            "name": "บางมะพร้าว",
            "postalCode": "86110"
          },
          {
            "name": "บางน้ำจืด",
            "postalCode": "86150"
          },
          {
            "name": "ปากน้ำ",
            "postalCode": "86150"
          },
          {
            "name": "พ้อแดง",
            "postalCode": "86110"
          },
          {
            "name": "แหลมทราย",
            "postalCode": "86110"
          },
          {
            "name": "วังตะกอ",
            "postalCode": "86110"
          },
          {
            "name": "หาดยาย",
            "postalCode": "86110"
          }
        ]
      },
      {
        "name": "ละแม",
        "subDistricts": [
          {
            "name": "ละแม",
            "postalCode": "86170"
          },
          {
            "name": "ทุ่งหลวง",
            "postalCode": "86170"
          },
          {
            "name": "สวนแตง",
            "postalCode": "86170"
          },
          {
            "name": "ทุ่งคาวัด",
            "postalCode": "86170"
          }
        ]
      },
      {
        "name": "พะโต๊ะ",
        "subDistricts": [
          {
            "name": "พะโต๊ะ",
            "postalCode": "86180"
          },
          {
            "name": "ปากทรง",
            "postalCode": "86180"
          },
          {
            "name": "ปังหวาน",
            "postalCode": "86180"
          },
          {
            "name": "พระรักษ์",
            "postalCode": "86180"
          }
        ]
      },
      {
        "name": "สวี",
        "subDistricts": [
          {
            "name": "นาโพธิ์",
            "postalCode": "86130"
          },
          {
            "name": "สวี",
            "postalCode": "86130"
          },
          {
            "name": "ทุ่งระยะ",
            "postalCode": "86130"
          },
          {
            "name": "ท่าหิน",
            "postalCode": "86130"
          },
          {
            "name": "ปากแพรก",
            "postalCode": "86130"
          },
          {
            "name": "ด่านสวี",
            "postalCode": "86130"
          },
          {
            "name": "ครน",
            "postalCode": "86130"
          },
          {
            "name": "วิสัยใต้",
            "postalCode": "86130"
          },
          {
            "name": "นาสัก",
            "postalCode": "86130"
          },
          {
            "name": "เขาทะลุ",
            "postalCode": "86130"
          },
          {
            "name": "เขาค่าย",
            "postalCode": "86130"
          }
        ]
      },
      {
        "name": "ทุ่งตะโก",
        "subDistricts": [
          {
            "name": "ปากตะโก",
            "postalCode": "86220"
          },
          {
            "name": "ทุ่งตะไคร",
            "postalCode": "86220"
          },
          {
            "name": "ตะโก",
            "postalCode": "86220"
          },
          {
            "name": "ช่องไม้แก้ว",
            "postalCode": "86220"
          }
        ]
      }
    ]
  },
  {
    "name": "สงขลา",
    "districts": [
      {
        "name": "เมืองสงขลา",
        "subDistricts": [
          {
            "name": "บ่อยาง",
            "postalCode": "90000"
          },
          {
            "name": "เขารูปช้าง",
            "postalCode": "90000"
          },
          {
            "name": "เกาะแต้ว",
            "postalCode": "90000"
          },
          {
            "name": "พะวง",
            "postalCode": "90100"
          },
          {
            "name": "ทุ่งหวัง",
            "postalCode": "90000"
          },
          {
            "name": "เกาะยอ",
            "postalCode": "90100"
          }
        ]
      },
      {
        "name": "สทิงพระ",
        "subDistricts": [
          {
            "name": "จะทิ้งพระ",
            "postalCode": "90190"
          },
          {
            "name": "กระดังงา",
            "postalCode": "90190"
          },
          {
            "name": "สนามชัย",
            "postalCode": "90190"
          },
          {
            "name": "ดีหลวง",
            "postalCode": "90190"
          },
          {
            "name": "ชุมพล",
            "postalCode": "90190"
          },
          {
            "name": "คลองรี",
            "postalCode": "90190"
          },
          {
            "name": "คูขุด",
            "postalCode": "90190"
          },
          {
            "name": "ท่าหิน",
            "postalCode": "90190"
          },
          {
            "name": "วัดจันทร์",
            "postalCode": "90190"
          },
          {
            "name": "บ่อแดง",
            "postalCode": "90190"
          },
          {
            "name": "บ่อดาน",
            "postalCode": "90190"
          }
        ]
      },
      {
        "name": "จะนะ",
        "subDistricts": [
          {
            "name": "บ้านนา",
            "postalCode": "90130"
          },
          {
            "name": "ป่าชิง",
            "postalCode": "90130"
          },
          {
            "name": "สะพานไม้แก่น",
            "postalCode": "90130"
          },
          {
            "name": "สะกอม",
            "postalCode": "90130"
          },
          {
            "name": "นาหว้า",
            "postalCode": "90130"
          },
          {
            "name": "นาทับ",
            "postalCode": "90130"
          },
          {
            "name": "น้ำขาว",
            "postalCode": "90130"
          },
          {
            "name": "ขุนตัดหวาย",
            "postalCode": "90130"
          },
          {
            "name": "ท่าหมอไทร",
            "postalCode": "90130"
          },
          {
            "name": "จะโหนง",
            "postalCode": "90130"
          },
          {
            "name": "คู",
            "postalCode": "90130"
          },
          {
            "name": "แค",
            "postalCode": "90130"
          },
          {
            "name": "คลองเปียะ",
            "postalCode": "90130"
          },
          {
            "name": "ตลิ่งชัน",
            "postalCode": "90130"
          }
        ]
      },
      {
        "name": "นาทวี",
        "subDistricts": [
          {
            "name": "นาทวี",
            "postalCode": "90160"
          },
          {
            "name": "ฉาง",
            "postalCode": "90160"
          },
          {
            "name": "นาหมอศรี",
            "postalCode": "90160"
          },
          {
            "name": "คลองทราย",
            "postalCode": "90160"
          },
          {
            "name": "ปลักหนู",
            "postalCode": "90160"
          },
          {
            "name": "ท่าประดู่",
            "postalCode": "90160"
          },
          {
            "name": "สะท้อน",
            "postalCode": "90160"
          },
          {
            "name": "ทับช้าง",
            "postalCode": "90160"
          },
          {
            "name": "ประกอบ",
            "postalCode": "90160"
          },
          {
            "name": "คลองกวาง",
            "postalCode": "90160"
          }
        ]
      },
      {
        "name": "เทพา",
        "subDistricts": [
          {
            "name": "เทพา",
            "postalCode": "90150"
          },
          {
            "name": "ปากบาง",
            "postalCode": "90150"
          },
          {
            "name": "เกาะสะบ้า",
            "postalCode": "90150"
          },
          {
            "name": "ลำไพล",
            "postalCode": "90260"
          },
          {
            "name": "ท่าม่วง",
            "postalCode": "90260"
          },
          {
            "name": "วังใหญ่",
            "postalCode": "90260"
          },
          {
            "name": "สะกอม",
            "postalCode": "90150"
          }
        ]
      },
      {
        "name": "สะบ้าย้อย",
        "subDistricts": [
          {
            "name": "สะบ้าย้อย",
            "postalCode": "90210"
          },
          {
            "name": "ทุ่งพอ",
            "postalCode": "90210"
          },
          {
            "name": "เปียน",
            "postalCode": "90210"
          },
          {
            "name": "บ้านโหนด",
            "postalCode": "90210"
          },
          {
            "name": "จะแหน",
            "postalCode": "90210"
          },
          {
            "name": "คูหา",
            "postalCode": "90210"
          },
          {
            "name": "เขาแดง",
            "postalCode": "90210"
          },
          {
            "name": "บาโหย",
            "postalCode": "90210"
          },
          {
            "name": "ธารคีรี",
            "postalCode": "90210"
          }
        ]
      },
      {
        "name": "ระโนด",
        "subDistricts": [
          {
            "name": "ระโนด",
            "postalCode": "90140"
          },
          {
            "name": "คลองแดน",
            "postalCode": "90140"
          },
          {
            "name": "ตะเครียะ",
            "postalCode": "90140"
          },
          {
            "name": "ท่าบอน",
            "postalCode": "90140"
          },
          {
            "name": "บ้านใหม่",
            "postalCode": "90140"
          },
          {
            "name": "บ่อตรุ",
            "postalCode": "90140"
          },
          {
            "name": "ปากแตระ",
            "postalCode": "90140"
          },
          {
            "name": "พังยาง",
            "postalCode": "90140"
          },
          {
            "name": "ระวะ",
            "postalCode": "90140"
          },
          {
            "name": "วัดสน",
            "postalCode": "90140"
          },
          {
            "name": "บ้านขาว",
            "postalCode": "90140"
          },
          {
            "name": "แดนสงวน",
            "postalCode": "90140"
          }
        ]
      },
      {
        "name": "กระแสสินธุ์",
        "subDistricts": [
          {
            "name": "เกาะใหญ่",
            "postalCode": "90270"
          },
          {
            "name": "โรง",
            "postalCode": "90270"
          },
          {
            "name": "เชิงแส",
            "postalCode": "90270"
          },
          {
            "name": "กระแสสินธุ์",
            "postalCode": "90270"
          }
        ]
      },
      {
        "name": "รัตภูมิ",
        "subDistricts": [
          {
            "name": "กำแพงเพชร",
            "postalCode": "90180"
          },
          {
            "name": "ท่าชะมวง",
            "postalCode": "90180"
          },
          {
            "name": "คูหาใต้",
            "postalCode": "90180"
          },
          {
            "name": "ควนรู",
            "postalCode": "90180"
          },
          {
            "name": "เขาพระ",
            "postalCode": "90180"
          }
        ]
      },
      {
        "name": "สะเดา",
        "subDistricts": [
          {
            "name": "สะเดา",
            "postalCode": "90120"
          },
          {
            "name": "ปริก",
            "postalCode": "90120"
          },
          {
            "name": "พังลา",
            "postalCode": "90170"
          },
          {
            "name": "สำนักแต้ว",
            "postalCode": "90120"
          },
          {
            "name": "ทุ่งหมอ",
            "postalCode": "90240"
          },
          {
            "name": "ท่าโพธิ์",
            "postalCode": "90170"
          },
          {
            "name": "ปาดังเบซาร์",
            "postalCode": "90240"
          },
          {
            "name": "สำนักขาม",
            "postalCode": "90320"
          },
          {
            "name": "เขามีเกียรติ",
            "postalCode": "90170"
          }
        ]
      },
      {
        "name": "หาดใหญ่",
        "subDistricts": [
          {
            "name": "หาดใหญ่",
            "postalCode": "90110"
          },
          {
            "name": "ควนลัง",
            "postalCode": "90110"
          },
          {
            "name": "คูเต่า",
            "postalCode": "90110"
          },
          {
            "name": "คอหงส์",
            "postalCode": "90110"
          },
          {
            "name": "คลองแห",
            "postalCode": "90110"
          },
          {
            "name": "คลองอู่ตะเภา",
            "postalCode": "90110"
          },
          {
            "name": "ฉลุง",
            "postalCode": "90110"
          },
          {
            "name": "ทุ่งใหญ่",
            "postalCode": "90110"
          },
          {
            "name": "ทุ่งตำเสา",
            "postalCode": "90110"
          },
          {
            "name": "ท่าข้าม",
            "postalCode": "90110"
          },
          {
            "name": "น้ำน้อย",
            "postalCode": "90110"
          },
          {
            "name": "บ้านพรุ",
            "postalCode": "90250"
          },
          {
            "name": "พะตง",
            "postalCode": "90230"
          }
        ]
      },
      {
        "name": "นาหม่อม",
        "subDistricts": [
          {
            "name": "นาหม่อม",
            "postalCode": "90310"
          },
          {
            "name": "พิจิตร",
            "postalCode": "90310"
          },
          {
            "name": "ทุ่งขมิ้น",
            "postalCode": "90310"
          },
          {
            "name": "คลองหรัง",
            "postalCode": "90310"
          }
        ]
      },
      {
        "name": "ควนเนียง",
        "subDistricts": [
          {
            "name": "รัตภูมิ",
            "postalCode": "90220"
          },
          {
            "name": "ควนโส",
            "postalCode": "90220"
          },
          {
            "name": "ห้วยลึก",
            "postalCode": "90220"
          },
          {
            "name": "บางเหรียง",
            "postalCode": "90220"
          }
        ]
      },
      {
        "name": "บางกล่ำ",
        "subDistricts": [
          {
            "name": "บางกล่ำ",
            "postalCode": "90110"
          },
          {
            "name": "ท่าช้าง",
            "postalCode": "90110"
          },
          {
            "name": "แม่ทอม",
            "postalCode": "90110"
          },
          {
            "name": "บ้านหาร",
            "postalCode": "90110"
          }
        ]
      },
      {
        "name": "สิงหนคร",
        "subDistricts": [
          {
            "name": "ชิงโค",
            "postalCode": "90280"
          },
          {
            "name": "สทิงหม้อ",
            "postalCode": "90280"
          },
          {
            "name": "ทำนบ",
            "postalCode": "90280"
          },
          {
            "name": "รำแดง",
            "postalCode": "90330"
          },
          {
            "name": "วัดขนุน",
            "postalCode": "90330"
          },
          {
            "name": "ชะแล้",
            "postalCode": "90330"
          },
          {
            "name": "ปากรอ",
            "postalCode": "90330"
          },
          {
            "name": "ป่าขาด",
            "postalCode": "90330"
          },
          {
            "name": "หัวเขา",
            "postalCode": "90280"
          },
          {
            "name": "บางเขียด",
            "postalCode": "90330"
          },
          {
            "name": "ม่วงงาม",
            "postalCode": "90330"
          }
        ]
      },
      {
        "name": "คลองหอยโข่ง",
        "subDistricts": [
          {
            "name": "คลองหอยโข่ง",
            "postalCode": "90230"
          },
          {
            "name": "ทุ่งลาน",
            "postalCode": "90230"
          },
          {
            "name": "โคกม่วง",
            "postalCode": "90230"
          },
          {
            "name": "คลองหลา",
            "postalCode": "90115"
          }
        ]
      }
    ]
  },
  {
    "name": "สตูล",
    "districts": [
      {
        "name": "เมืองสตูล",
        "subDistricts": [
          {
            "name": "พิมาน",
            "postalCode": "91000"
          },
          {
            "name": "คลองขุด",
            "postalCode": "91000"
          },
          {
            "name": "ควนขัน",
            "postalCode": "91000"
          },
          {
            "name": "บ้านควน",
            "postalCode": "91140"
          },
          {
            "name": "ฉลุง",
            "postalCode": "91140"
          },
          {
            "name": "เกาะสาหร่าย",
            "postalCode": "91000"
          },
          {
            "name": "ตันหยงโป",
            "postalCode": "91000"
          },
          {
            "name": "เจ๊ะบิลัง",
            "postalCode": "91000"
          },
          {
            "name": "ตำมะลัง",
            "postalCode": "91000"
          },
          {
            "name": "ปูยู",
            "postalCode": "91000"
          },
          {
            "name": "ควนโพธิ์",
            "postalCode": "91140"
          },
          {
            "name": "เกตรี",
            "postalCode": "91140"
          }
        ]
      },
      {
        "name": "ควนโดน",
        "subDistricts": [
          {
            "name": "ควนโดน",
            "postalCode": "91160"
          },
          {
            "name": "ควนสตอ",
            "postalCode": "91160"
          },
          {
            "name": "ย่านซื่อ",
            "postalCode": "91160"
          },
          {
            "name": "วังประจัน",
            "postalCode": "91160"
          }
        ]
      },
      {
        "name": "ควนกาหลง",
        "subDistricts": [
          {
            "name": "ทุ่งนุ้ย",
            "postalCode": "91130"
          },
          {
            "name": "ควนกาหลง",
            "postalCode": "91130"
          },
          {
            "name": "อุใดเจริญ",
            "postalCode": "91130"
          }
        ]
      },
      {
        "name": "ท่าแพ",
        "subDistricts": [
          {
            "name": "ท่าแพ",
            "postalCode": "91150"
          },
          {
            "name": "แป-ระ",
            "postalCode": "91150"
          },
          {
            "name": "สาคร",
            "postalCode": "91150"
          },
          {
            "name": "ท่าเรือ",
            "postalCode": "91150"
          }
        ]
      },
      {
        "name": "ละงู",
        "subDistricts": [
          {
            "name": "กำแพง",
            "postalCode": "91110"
          },
          {
            "name": "ละงู",
            "postalCode": "91110"
          },
          {
            "name": "เขาขาว",
            "postalCode": "91110"
          },
          {
            "name": "ปากน้ำ",
            "postalCode": "91110"
          },
          {
            "name": "น้ำผุด",
            "postalCode": "91110"
          },
          {
            "name": "แหลมสน",
            "postalCode": "91110"
          }
        ]
      },
      {
        "name": "ทุ่งหว้า",
        "subDistricts": [
          {
            "name": "ทุ่งหว้า",
            "postalCode": "91120"
          },
          {
            "name": "นาทอน",
            "postalCode": "91120"
          },
          {
            "name": "ขอนคลาน",
            "postalCode": "91120"
          },
          {
            "name": "ทุ่งบุหลัง",
            "postalCode": "91120"
          },
          {
            "name": "ป่าแก่บ่อหิน",
            "postalCode": "91120"
          }
        ]
      },
      {
        "name": "มะนัง",
        "subDistricts": [
          {
            "name": "ปาล์มพัฒนา",
            "postalCode": "91130"
          },
          {
            "name": "นิคมพัฒนา",
            "postalCode": "91130"
          }
        ]
      }
    ]
  },
  {
    "name": "ตรัง",
    "districts": [
      {
        "name": "เมืองตรัง",
        "subDistricts": [
          {
            "name": "ทับเที่ยง",
            "postalCode": "92000"
          },
          {
            "name": "นาพละ",
            "postalCode": "92000"
          },
          {
            "name": "บ้านควน",
            "postalCode": "92000"
          },
          {
            "name": "นาบินหลา",
            "postalCode": "92000"
          },
          {
            "name": "ควนปริง",
            "postalCode": "92000"
          },
          {
            "name": "นาโยงใต้",
            "postalCode": "92170"
          },
          {
            "name": "บางรัก",
            "postalCode": "92000"
          },
          {
            "name": "โคกหล่อ",
            "postalCode": "92000"
          },
          {
            "name": "นาโต๊ะหมิง",
            "postalCode": "92000"
          },
          {
            "name": "หนองตรุด",
            "postalCode": "92000"
          },
          {
            "name": "น้ำผุด",
            "postalCode": "92000"
          },
          {
            "name": "นาตาล่วง",
            "postalCode": "92000"
          },
          {
            "name": "บ้านโพธิ์",
            "postalCode": "92000"
          },
          {
            "name": "นาท่ามเหนือ",
            "postalCode": "92190"
          },
          {
            "name": "นาท่ามใต้",
            "postalCode": "92190"
          }
        ]
      },
      {
        "name": "กันตัง",
        "subDistricts": [
          {
            "name": "กันตัง",
            "postalCode": "92110"
          },
          {
            "name": "ควนธานี",
            "postalCode": "92110"
          },
          {
            "name": "บางหมาก",
            "postalCode": "92110"
          },
          {
            "name": "บางเป้า",
            "postalCode": "92110"
          },
          {
            "name": "วังวน",
            "postalCode": "92110"
          },
          {
            "name": "กันตังใต้",
            "postalCode": "92110"
          },
          {
            "name": "โคกยาง",
            "postalCode": "92110"
          },
          {
            "name": "คลองลุ",
            "postalCode": "92110"
          },
          {
            "name": "ย่านซื่อ",
            "postalCode": "92110"
          },
          {
            "name": "บ่อน้ำร้อน",
            "postalCode": "92110"
          },
          {
            "name": "บางสัก",
            "postalCode": "92110"
          },
          {
            "name": "นาเกลือ",
            "postalCode": "92110"
          },
          {
            "name": "เกาะลิบง",
            "postalCode": "92110"
          },
          {
            "name": "คลองชีล้อม",
            "postalCode": "92110"
          }
        ]
      },
      {
        "name": "ย่านตาขาว",
        "subDistricts": [
          {
            "name": "ย่านตาขาว",
            "postalCode": "92140"
          },
          {
            "name": "หนองบ่อ",
            "postalCode": "92140"
          },
          {
            "name": "นาชุมเห็ด",
            "postalCode": "92140"
          },
          {
            "name": "ในควน",
            "postalCode": "92140"
          },
          {
            "name": "โพรงจระเข้",
            "postalCode": "92140"
          },
          {
            "name": "ทุ่งกระบือ",
            "postalCode": "92140"
          },
          {
            "name": "ทุ่งค่าย",
            "postalCode": "92140"
          },
          {
            "name": "เกาะเปียะ",
            "postalCode": "92140"
          }
        ]
      },
      {
        "name": "ปะเหลียน",
        "subDistricts": [
          {
            "name": "ท่าข้าม",
            "postalCode": "92120"
          },
          {
            "name": "ทุ่งยาว",
            "postalCode": "92180"
          },
          {
            "name": "ปะเหลียน",
            "postalCode": "92180"
          },
          {
            "name": "บางด้วน",
            "postalCode": "92140"
          },
          {
            "name": "บ้านนา",
            "postalCode": "92140"
          },
          {
            "name": "สุโสะ",
            "postalCode": "92120"
          },
          {
            "name": "ลิพัง",
            "postalCode": "92180"
          },
          {
            "name": "เกาะสุกร",
            "postalCode": "92120"
          },
          {
            "name": "ท่าพญา",
            "postalCode": "92140"
          },
          {
            "name": "แหลมสอม",
            "postalCode": "92180"
          }
        ]
      },
      {
        "name": "สิเกา",
        "subDistricts": [
          {
            "name": "บ่อหิน",
            "postalCode": "92150"
          },
          {
            "name": "เขาไม้แก้ว",
            "postalCode": "92150"
          },
          {
            "name": "กะลาเส",
            "postalCode": "92150"
          },
          {
            "name": "ไม้ฝาด",
            "postalCode": "92150"
          },
          {
            "name": "นาเมืองเพชร",
            "postalCode": "92000"
          }
        ]
      },
      {
        "name": "ห้วยยอด",
        "subDistricts": [
          {
            "name": "ห้วยยอด",
            "postalCode": "92130"
          },
          {
            "name": "หนองช้างแล่น",
            "postalCode": "92130"
          },
          {
            "name": "บางดี",
            "postalCode": "92210"
          },
          {
            "name": "บางกุ้ง",
            "postalCode": "92210"
          },
          {
            "name": "เขากอบ",
            "postalCode": "92130"
          },
          {
            "name": "เขาขาว",
            "postalCode": "92130"
          },
          {
            "name": "เขาปูน",
            "postalCode": "92130"
          },
          {
            "name": "ปากแจ่ม",
            "postalCode": "92190"
          },
          {
            "name": "ปากคม",
            "postalCode": "92130"
          },
          {
            "name": "ท่างิ้ว",
            "postalCode": "92130"
          },
          {
            "name": "ลำภูรา",
            "postalCode": "92190"
          },
          {
            "name": "นาวง",
            "postalCode": "92210"
          },
          {
            "name": "ห้วยนาง",
            "postalCode": "92130"
          },
          {
            "name": "ในเตา",
            "postalCode": "92130"
          },
          {
            "name": "ทุ่งต่อ",
            "postalCode": "92130"
          },
          {
            "name": "วังคีรี",
            "postalCode": "92210"
          }
        ]
      },
      {
        "name": "วังวิเศษ",
        "subDistricts": [
          {
            "name": "เขาวิเศษ",
            "postalCode": "92220"
          },
          {
            "name": "วังมะปราง",
            "postalCode": "92220"
          },
          {
            "name": "อ่าวตง",
            "postalCode": "92220"
          },
          {
            "name": "ท่าสะบ้า",
            "postalCode": "92000"
          },
          {
            "name": "วังมะปรางเหนือ",
            "postalCode": "92220"
          }
        ]
      },
      {
        "name": "นาโยง",
        "subDistricts": [
          {
            "name": "นาโยงเหนือ",
            "postalCode": "92170"
          },
          {
            "name": "ช่อง",
            "postalCode": "92170"
          },
          {
            "name": "ละมอ",
            "postalCode": "92170"
          },
          {
            "name": "โคกสะบ้า",
            "postalCode": "92170"
          },
          {
            "name": "นาหมื่นศรี",
            "postalCode": "92170"
          },
          {
            "name": "นาข้าวเสีย",
            "postalCode": "92170"
          }
        ]
      },
      {
        "name": "รัษฎา",
        "subDistricts": [
          {
            "name": "ควนเมา",
            "postalCode": "92160"
          },
          {
            "name": "คลองปาง",
            "postalCode": "92160"
          },
          {
            "name": "หนองบัว",
            "postalCode": "92160"
          },
          {
            "name": "หนองปรือ",
            "postalCode": "92130"
          },
          {
            "name": "เขาไพร",
            "postalCode": "92160"
          }
        ]
      },
      {
        "name": "หาดสำราญ",
        "subDistricts": [
          {
            "name": "หาดสำราญ",
            "postalCode": "92120"
          },
          {
            "name": "บ้าหวี",
            "postalCode": "92120"
          },
          {
            "name": "ตะเสะ",
            "postalCode": "92120"
          }
        ]
      }
    ]
  },
  {
    "name": "พัทลุง",
    "districts": [
      {
        "name": "เมืองพัทลุง",
        "subDistricts": [
          {
            "name": "คูหาสวรรค์",
            "postalCode": "93000"
          },
          {
            "name": "เขาเจียก",
            "postalCode": "93000"
          },
          {
            "name": "ท่ามิหรำ",
            "postalCode": "93000"
          },
          {
            "name": "โคกชะงาย",
            "postalCode": "93000"
          },
          {
            "name": "นาท่อม",
            "postalCode": "93000"
          },
          {
            "name": "ปรางหมู่",
            "postalCode": "93000"
          },
          {
            "name": "ท่าแค",
            "postalCode": "93000"
          },
          {
            "name": "ลำปำ",
            "postalCode": "93000"
          },
          {
            "name": "ตำนาน",
            "postalCode": "93000"
          },
          {
            "name": "ควนมะพร้าว",
            "postalCode": "93000"
          },
          {
            "name": "ร่มเมือง",
            "postalCode": "93000"
          },
          {
            "name": "ชัยบุรี",
            "postalCode": "93000"
          },
          {
            "name": "นาโหนด",
            "postalCode": "93000"
          },
          {
            "name": "พญาขัน",
            "postalCode": "93000"
          }
        ]
      },
      {
        "name": "กงหรา",
        "subDistricts": [
          {
            "name": "กงหรา",
            "postalCode": "93180"
          },
          {
            "name": "ชะรัด",
            "postalCode": "93000"
          },
          {
            "name": "คลองเฉลิม",
            "postalCode": "93180"
          },
          {
            "name": "คลองทรายขาว",
            "postalCode": "93180"
          },
          {
            "name": "สมหวัง",
            "postalCode": "93000"
          }
        ]
      },
      {
        "name": "เขาชัยสน",
        "subDistricts": [
          {
            "name": "เขาชัยสน",
            "postalCode": "93130"
          },
          {
            "name": "ควนขนุน",
            "postalCode": "93130"
          },
          {
            "name": "จองถนน",
            "postalCode": "93130"
          },
          {
            "name": "หานโพธิ์",
            "postalCode": "93130"
          },
          {
            "name": "โคกม่วง",
            "postalCode": "93130"
          }
        ]
      },
      {
        "name": "ตะโหมด",
        "subDistricts": [
          {
            "name": "แม่ขรี",
            "postalCode": "93160"
          },
          {
            "name": "ตะโหมด",
            "postalCode": "93160"
          },
          {
            "name": "คลองใหญ่",
            "postalCode": "93160"
          }
        ]
      },
      {
        "name": "ควนขนุน",
        "subDistricts": [
          {
            "name": "ควนขนุน",
            "postalCode": "93110"
          },
          {
            "name": "ทะเลน้อย",
            "postalCode": "93150"
          },
          {
            "name": "นาขยาด",
            "postalCode": "93110"
          },
          {
            "name": "พนมวังก์",
            "postalCode": "93110"
          },
          {
            "name": "แหลมโตนด",
            "postalCode": "93110"
          },
          {
            "name": "ปันแต",
            "postalCode": "93110"
          },
          {
            "name": "โตนดด้วน",
            "postalCode": "93110"
          },
          {
            "name": "ดอนทราย",
            "postalCode": "93110"
          },
          {
            "name": "มะกอกเหนือ",
            "postalCode": "93150"
          },
          {
            "name": "พนางตุง",
            "postalCode": "93150"
          },
          {
            "name": "ชะมวง",
            "postalCode": "93110"
          },
          {
            "name": "แพรกหา",
            "postalCode": "93110"
          }
        ]
      },
      {
        "name": "ปากพะยูน",
        "subDistricts": [
          {
            "name": "ปากพะยูน",
            "postalCode": "93120"
          },
          {
            "name": "ดอนประดู่",
            "postalCode": "93120"
          },
          {
            "name": "เกาะนางคำ",
            "postalCode": "93120"
          },
          {
            "name": "เกาะหมาก",
            "postalCode": "93120"
          },
          {
            "name": "ฝาละมี",
            "postalCode": "93120"
          },
          {
            "name": "หารเทา",
            "postalCode": "93120"
          },
          {
            "name": "ดอนทราย",
            "postalCode": "93120"
          }
        ]
      },
      {
        "name": "ศรีบรรพต",
        "subDistricts": [
          {
            "name": "เขาย่า",
            "postalCode": "93190"
          },
          {
            "name": "เขาปู่",
            "postalCode": "93190"
          },
          {
            "name": "ตะแพน",
            "postalCode": "93190"
          }
        ]
      },
      {
        "name": "ป่าบอน",
        "subDistricts": [
          {
            "name": "ป่าบอน",
            "postalCode": "93170"
          },
          {
            "name": "โคกทราย",
            "postalCode": "93170"
          },
          {
            "name": "หนองธง",
            "postalCode": "93170"
          },
          {
            "name": "ทุ่งนารี",
            "postalCode": "93170"
          },
          {
            "name": "วังใหม่",
            "postalCode": "93170"
          }
        ]
      },
      {
        "name": "บางแก้ว",
        "subDistricts": [
          {
            "name": "ท่ามะเดื่อ",
            "postalCode": "93140"
          },
          {
            "name": "นาปะขอ",
            "postalCode": "93140"
          },
          {
            "name": "โคกสัก",
            "postalCode": "93140"
          }
        ]
      },
      {
        "name": "ป่าพะยอม",
        "subDistricts": [
          {
            "name": "ป่าพะยอม",
            "postalCode": "93110"
          },
          {
            "name": "ลานข่อย",
            "postalCode": "93110"
          },
          {
            "name": "เกาะเต่า",
            "postalCode": "93110"
          },
          {
            "name": "บ้านพร้าว",
            "postalCode": "93110"
          }
        ]
      },
      {
        "name": "ศรีนครินทร์",
        "subDistricts": [
          {
            "name": "ชุมพล",
            "postalCode": "93000"
          },
          {
            "name": "บ้านนา",
            "postalCode": "93000"
          },
          {
            "name": "อ่างทอง",
            "postalCode": "93000"
          },
          {
            "name": "ลำสินธุ์",
            "postalCode": "93000"
          }
        ]
      }
    ]
  },
  {
    "name": "ปัตตานี",
    "districts": [
      {
        "name": "เมืองปัตตานี",
        "subDistricts": [
          {
            "name": "สะบารัง",
            "postalCode": "94000"
          },
          {
            "name": "อาเนาะรู",
            "postalCode": "94000"
          },
          {
            "name": "จะบังติกอ",
            "postalCode": "94000"
          },
          {
            "name": "บานา",
            "postalCode": "94000"
          },
          {
            "name": "ตันหยงลุโละ",
            "postalCode": "94000"
          },
          {
            "name": "คลองมานิง",
            "postalCode": "94000"
          },
          {
            "name": "กะมิยอ",
            "postalCode": "94000"
          },
          {
            "name": "บาราโหม",
            "postalCode": "94000"
          },
          {
            "name": "ปะกาฮะรัง",
            "postalCode": "94000"
          },
          {
            "name": "รูสะมิแล",
            "postalCode": "94000"
          },
          {
            "name": "ตะลุโบะ",
            "postalCode": "94000"
          },
          {
            "name": "บาราเฮาะ",
            "postalCode": "94000"
          },
          {
            "name": "ปุยุด",
            "postalCode": "94000"
          }
        ]
      },
      {
        "name": "โคกโพธิ์",
        "subDistricts": [
          {
            "name": "โคกโพธิ์",
            "postalCode": "94120"
          },
          {
            "name": "มะกรูด",
            "postalCode": "94120"
          },
          {
            "name": "บางโกระ",
            "postalCode": "94120"
          },
          {
            "name": "ป่าบอน",
            "postalCode": "94120"
          },
          {
            "name": "ทรายขาว",
            "postalCode": "94120"
          },
          {
            "name": "นาประดู่",
            "postalCode": "94180"
          },
          {
            "name": "ปากล่อ",
            "postalCode": "94180"
          },
          {
            "name": "ทุ่งพลา",
            "postalCode": "94180"
          },
          {
            "name": "ท่าเรือ",
            "postalCode": "94120"
          },
          {
            "name": "นาเกตุ",
            "postalCode": "94120"
          },
          {
            "name": "ควนโนรี",
            "postalCode": "94180"
          },
          {
            "name": "ช้างให้ตก",
            "postalCode": "94120"
          }
        ]
      },
      {
        "name": "หนองจิก",
        "subDistricts": [
          {
            "name": "เกาะเปาะ",
            "postalCode": "94170"
          },
          {
            "name": "คอลอตันหยง",
            "postalCode": "94170"
          },
          {
            "name": "ดอนรัก",
            "postalCode": "94170"
          },
          {
            "name": "ดาโต๊ะ",
            "postalCode": "94170"
          },
          {
            "name": "ตุยง",
            "postalCode": "94170"
          },
          {
            "name": "ท่ากำชำ",
            "postalCode": "94170"
          },
          {
            "name": "บ่อทอง",
            "postalCode": "94170"
          },
          {
            "name": "บางเขา",
            "postalCode": "94170"
          },
          {
            "name": "บางตาวา",
            "postalCode": "94170"
          },
          {
            "name": "ปุโละปุโย",
            "postalCode": "94170"
          },
          {
            "name": "ยาบี",
            "postalCode": "94170"
          },
          {
            "name": "ลิปะสะโง",
            "postalCode": "94170"
          }
        ]
      },
      {
        "name": "ปะนาเระ",
        "subDistricts": [
          {
            "name": "ปะนาเระ",
            "postalCode": "94130"
          },
          {
            "name": "ท่าข้าม",
            "postalCode": "94130"
          },
          {
            "name": "บ้านนอก",
            "postalCode": "94130"
          },
          {
            "name": "ดอน",
            "postalCode": "94130"
          },
          {
            "name": "ควน",
            "postalCode": "94190"
          },
          {
            "name": "ท่าน้ำ",
            "postalCode": "94130"
          },
          {
            "name": "คอกกระบือ",
            "postalCode": "94130"
          },
          {
            "name": "พ่อมิ่ง",
            "postalCode": "94130"
          },
          {
            "name": "บ้านกลาง",
            "postalCode": "94130"
          },
          {
            "name": "บ้านน้ำบ่อ",
            "postalCode": "94130"
          }
        ]
      },
      {
        "name": "มายอ",
        "subDistricts": [
          {
            "name": "มายอ",
            "postalCode": "94140"
          },
          {
            "name": "ถนน",
            "postalCode": "94140"
          },
          {
            "name": "ตรัง",
            "postalCode": "94140"
          },
          {
            "name": "กระหวะ",
            "postalCode": "94140"
          },
          {
            "name": "ลุโบะยิไร",
            "postalCode": "94140"
          },
          {
            "name": "ลางา",
            "postalCode": "94190"
          },
          {
            "name": "กระเสาะ",
            "postalCode": "94140"
          },
          {
            "name": "เกาะจัน",
            "postalCode": "94140"
          },
          {
            "name": "ปะโด",
            "postalCode": "94140"
          },
          {
            "name": "สาคอบน",
            "postalCode": "94140"
          },
          {
            "name": "สาคอใต้",
            "postalCode": "94140"
          },
          {
            "name": "สะกำ",
            "postalCode": "94140"
          },
          {
            "name": "ปานัน",
            "postalCode": "94140"
          }
        ]
      },
      {
        "name": "ทุ่งยางแดง",
        "subDistricts": [
          {
            "name": "ตะโละแมะนา",
            "postalCode": "94140"
          },
          {
            "name": "พิเทน",
            "postalCode": "94140"
          },
          {
            "name": "น้ำดำ",
            "postalCode": "94140"
          },
          {
            "name": "ปากู",
            "postalCode": "94140"
          }
        ]
      },
      {
        "name": "สายบุรี",
        "subDistricts": [
          {
            "name": "ตะลุบัน",
            "postalCode": "94110"
          },
          {
            "name": "ตะบิ้ง",
            "postalCode": "94110"
          },
          {
            "name": "ปะเสยะวอ",
            "postalCode": "94110"
          },
          {
            "name": "บางเก่า",
            "postalCode": "94110"
          },
          {
            "name": "บือเระ",
            "postalCode": "94110"
          },
          {
            "name": "เตราะบอน",
            "postalCode": "94110"
          },
          {
            "name": "กะดุนง",
            "postalCode": "94110"
          },
          {
            "name": "ละหาร",
            "postalCode": "94110"
          },
          {
            "name": "มะนังดาลำ",
            "postalCode": "94110"
          },
          {
            "name": "แป้น",
            "postalCode": "94110"
          },
          {
            "name": "ทุ่งคล้า",
            "postalCode": "94190"
          }
        ]
      },
      {
        "name": "ไม้แก่น",
        "subDistricts": [
          {
            "name": "ไทรทอง",
            "postalCode": "94220"
          },
          {
            "name": "ไม้แก่น",
            "postalCode": "94220"
          },
          {
            "name": "ตะโละไกรทอง",
            "postalCode": "94220"
          },
          {
            "name": "ดอนทราย",
            "postalCode": "94220"
          }
        ]
      },
      {
        "name": "ยะหริ่ง",
        "subDistricts": [
          {
            "name": "ตะโละ",
            "postalCode": "94150"
          },
          {
            "name": "ตะโละกาโปร์",
            "postalCode": "94150"
          },
          {
            "name": "ตันหยงดาลอ",
            "postalCode": "94150"
          },
          {
            "name": "ตันหยงจึงงา",
            "postalCode": "94190"
          },
          {
            "name": "ตอหลัง",
            "postalCode": "94150"
          },
          {
            "name": "ตาแกะ",
            "postalCode": "94150"
          },
          {
            "name": "ตาลีอายร์",
            "postalCode": "94150"
          },
          {
            "name": "ยามู",
            "postalCode": "94150"
          },
          {
            "name": "บางปู",
            "postalCode": "94150"
          },
          {
            "name": "หนองแรต",
            "postalCode": "94150"
          },
          {
            "name": "ปิยามุมัง",
            "postalCode": "94150"
          },
          {
            "name": "ปุลากง",
            "postalCode": "94150"
          },
          {
            "name": "บาโลย",
            "postalCode": "94190"
          },
          {
            "name": "สาบัน",
            "postalCode": "94150"
          },
          {
            "name": "มะนังยง",
            "postalCode": "94150"
          },
          {
            "name": "ราตาปันยัง",
            "postalCode": "94150"
          },
          {
            "name": "จะรัง",
            "postalCode": "94150"
          },
          {
            "name": "แหลมโพธิ์",
            "postalCode": "94150"
          }
        ]
      },
      {
        "name": "ยะรัง",
        "subDistricts": [
          {
            "name": "ยะรัง",
            "postalCode": "94160"
          },
          {
            "name": "สะดาวา",
            "postalCode": "94160"
          },
          {
            "name": "ประจัน",
            "postalCode": "94160"
          },
          {
            "name": "สะนอ",
            "postalCode": "94160"
          },
          {
            "name": "ระแว้ง",
            "postalCode": "94160"
          },
          {
            "name": "ปิตูมุดี",
            "postalCode": "94160"
          },
          {
            "name": "วัด",
            "postalCode": "94160"
          },
          {
            "name": "กระโด",
            "postalCode": "94160"
          },
          {
            "name": "คลองใหม่",
            "postalCode": "94160"
          },
          {
            "name": "เมาะมาวี",
            "postalCode": "94160"
          },
          {
            "name": "กอลำ",
            "postalCode": "94160"
          },
          {
            "name": "เขาตูม",
            "postalCode": "94160"
          }
        ]
      },
      {
        "name": "กะพ้อ",
        "subDistricts": [
          {
            "name": "กะรุบี",
            "postalCode": "94230"
          },
          {
            "name": "ตะโละดือรามัน",
            "postalCode": "94230"
          },
          {
            "name": "ปล่องหอย",
            "postalCode": "94230"
          }
        ]
      },
      {
        "name": "แม่ลาน",
        "subDistricts": [
          {
            "name": "แม่ลาน",
            "postalCode": "94180"
          },
          {
            "name": "ม่วงเตี้ย",
            "postalCode": "94180"
          },
          {
            "name": "ป่าไร่",
            "postalCode": "94180"
          }
        ]
      }
    ]
  },
  {
    "name": "ยะลา",
    "districts": [
      {
        "name": "เมืองยะลา",
        "subDistricts": [
          {
            "name": "สะเตง",
            "postalCode": "95000"
          },
          {
            "name": "บุดี",
            "postalCode": "95000"
          },
          {
            "name": "ยุโป",
            "postalCode": "95000"
          },
          {
            "name": "ลิดล",
            "postalCode": "95160"
          },
          {
            "name": "ยะลา",
            "postalCode": "95000"
          },
          {
            "name": "ท่าสาป",
            "postalCode": "95000"
          },
          {
            "name": "ลำใหม่",
            "postalCode": "95160"
          },
          {
            "name": "หน้าถ้ำ",
            "postalCode": "95000"
          },
          {
            "name": "ลำพะยา",
            "postalCode": "95160"
          },
          {
            "name": "เปาะเส้ง",
            "postalCode": "95000"
          },
          {
            "name": "พร่อน",
            "postalCode": "95160"
          },
          {
            "name": "บันนังสาเรง",
            "postalCode": "95000"
          },
          {
            "name": "สะเตงนอก",
            "postalCode": "95000"
          },
          {
            "name": "ตาเซะ",
            "postalCode": "95000"
          }
        ]
      },
      {
        "name": "เบตง",
        "subDistricts": [
          {
            "name": "เบตง",
            "postalCode": "95110"
          },
          {
            "name": "ยะรม",
            "postalCode": "95110"
          },
          {
            "name": "ตาเนาะแมเราะ",
            "postalCode": "95110"
          },
          {
            "name": "อัยเยอร์เวง",
            "postalCode": "95110"
          },
          {
            "name": "ธารน้ำทิพย์",
            "postalCode": "95110"
          }
        ]
      },
      {
        "name": "บันนังสตา",
        "subDistricts": [
          {
            "name": "บันนังสตา",
            "postalCode": "95130"
          },
          {
            "name": "บาเจาะ",
            "postalCode": "95130"
          },
          {
            "name": "ตาเนาะปูเต๊ะ",
            "postalCode": "95130"
          },
          {
            "name": "ถ้ำทะลุ",
            "postalCode": "95130"
          },
          {
            "name": "ตลิ่งชัน",
            "postalCode": "95130"
          },
          {
            "name": "เขื่อนบางลาง",
            "postalCode": "95130"
          }
        ]
      },
      {
        "name": "ธารโต",
        "subDistricts": [
          {
            "name": "ธารโต",
            "postalCode": "95150"
          },
          {
            "name": "บ้านแหร",
            "postalCode": "95150"
          },
          {
            "name": "แม่หวาด",
            "postalCode": "95170"
          },
          {
            "name": "คีรีเขต",
            "postalCode": "95150"
          }
        ]
      },
      {
        "name": "ยะหา",
        "subDistricts": [
          {
            "name": "ยะหา",
            "postalCode": "95120"
          },
          {
            "name": "ละแอ",
            "postalCode": "95120"
          },
          {
            "name": "ปะแต",
            "postalCode": "95120"
          },
          {
            "name": "บาโร๊ะ",
            "postalCode": "95120"
          },
          {
            "name": "ตาชี",
            "postalCode": "95120"
          },
          {
            "name": "บาโงยซิแน",
            "postalCode": "95120"
          },
          {
            "name": "กาตอง",
            "postalCode": "95120"
          }
        ]
      },
      {
        "name": "รามัน",
        "subDistricts": [
          {
            "name": "กายูบอเกาะ",
            "postalCode": "95140"
          },
          {
            "name": "กาลูปัง",
            "postalCode": "95140"
          },
          {
            "name": "กาลอ",
            "postalCode": "95140"
          },
          {
            "name": "กอตอตือร๊ะ",
            "postalCode": "95140"
          },
          {
            "name": "โกตาบารู",
            "postalCode": "95140"
          },
          {
            "name": "เกะรอ",
            "postalCode": "95140"
          },
          {
            "name": "จะกว๊ะ",
            "postalCode": "95140"
          },
          {
            "name": "ท่าธง",
            "postalCode": "95140"
          },
          {
            "name": "เนินงาม",
            "postalCode": "95140"
          },
          {
            "name": "บาลอ",
            "postalCode": "95140"
          },
          {
            "name": "บาโงย",
            "postalCode": "95140"
          },
          {
            "name": "บือมัง",
            "postalCode": "95140"
          },
          {
            "name": "ยะต๊ะ",
            "postalCode": "95140"
          },
          {
            "name": "วังพญา",
            "postalCode": "95140"
          },
          {
            "name": "อาซ่อง",
            "postalCode": "95140"
          },
          {
            "name": "ตะโล๊ะหะลอ",
            "postalCode": "95140"
          }
        ]
      },
      {
        "name": "กาบัง",
        "subDistricts": [
          {
            "name": "กาบัง",
            "postalCode": "95120"
          },
          {
            "name": "บาละ",
            "postalCode": "95120"
          }
        ]
      },
      {
        "name": "กรงปินัง",
        "subDistricts": [
          {
            "name": "กรงปินัง",
            "postalCode": "95000"
          },
          {
            "name": "สะเอะ",
            "postalCode": "95000"
          },
          {
            "name": "ห้วยกระทิง",
            "postalCode": "95000"
          },
          {
            "name": "ปุโรง",
            "postalCode": "95000"
          }
        ]
      }
    ]
  },
  {
    "name": "นราธิวาส",
    "districts": [
      {
        "name": "เมืองนราธิวาส",
        "subDistricts": [
          {
            "name": "บางนาค",
            "postalCode": "96000"
          },
          {
            "name": "ลำภู",
            "postalCode": "96000"
          },
          {
            "name": "มะนังตายอ",
            "postalCode": "96000"
          },
          {
            "name": "บางปอ",
            "postalCode": "96000"
          },
          {
            "name": "กะลุวอ",
            "postalCode": "96000"
          },
          {
            "name": "กะลุวอเหนือ",
            "postalCode": "96000"
          },
          {
            "name": "โคกเคียน",
            "postalCode": "96000"
          }
        ]
      },
      {
        "name": "ตากใบ",
        "subDistricts": [
          {
            "name": "เจ๊ะเห",
            "postalCode": "96110"
          },
          {
            "name": "ไพรวัน",
            "postalCode": "96110"
          },
          {
            "name": "พร่อน",
            "postalCode": "96110"
          },
          {
            "name": "ศาลาใหม่",
            "postalCode": "96110"
          },
          {
            "name": "บางขุนทอง",
            "postalCode": "96110"
          },
          {
            "name": "เกาะสะท้อน",
            "postalCode": "96110"
          },
          {
            "name": "นานาค",
            "postalCode": "96110"
          },
          {
            "name": "โฆษิต",
            "postalCode": "96110"
          }
        ]
      },
      {
        "name": "บาเจาะ",
        "subDistricts": [
          {
            "name": "บาเจาะ",
            "postalCode": "96170"
          },
          {
            "name": "ลุโบะสาวอ",
            "postalCode": "96170"
          },
          {
            "name": "กาเยาะมาตี",
            "postalCode": "96170"
          },
          {
            "name": "ปะลุกาสาเมาะ",
            "postalCode": "96170"
          },
          {
            "name": "บาเระเหนือ",
            "postalCode": "96170"
          },
          {
            "name": "บาเระใต้",
            "postalCode": "96170"
          }
        ]
      },
      {
        "name": "ยี่งอ",
        "subDistricts": [
          {
            "name": "ยี่งอ",
            "postalCode": "96180"
          },
          {
            "name": "ละหาร",
            "postalCode": "96180"
          },
          {
            "name": "จอเบาะ",
            "postalCode": "96180"
          },
          {
            "name": "ลุโบะบายะ",
            "postalCode": "96180"
          },
          {
            "name": "ลุโบะบือซา",
            "postalCode": "96180"
          },
          {
            "name": "ตะปอเยาะ",
            "postalCode": "96180"
          }
        ]
      },
      {
        "name": "ระแงะ",
        "subDistricts": [
          {
            "name": "ตันหยงมัส",
            "postalCode": "96130"
          },
          {
            "name": "ตันหยงลิมอ",
            "postalCode": "96130"
          },
          {
            "name": "บองอ",
            "postalCode": "96220"
          },
          {
            "name": "กาลิซา",
            "postalCode": "96130"
          },
          {
            "name": "บาโงสะโต",
            "postalCode": "96130"
          },
          {
            "name": "เฉลิม",
            "postalCode": "96130"
          },
          {
            "name": "มะรือโบตก",
            "postalCode": "96130"
          }
        ]
      },
      {
        "name": "รือเสาะ",
        "subDistricts": [
          {
            "name": "รือเสาะ",
            "postalCode": "96150"
          },
          {
            "name": "สาวอ",
            "postalCode": "96150"
          },
          {
            "name": "เรียง",
            "postalCode": "96150"
          },
          {
            "name": "สามัคคี",
            "postalCode": "96150"
          },
          {
            "name": "บาตง",
            "postalCode": "96150"
          },
          {
            "name": "ลาโละ",
            "postalCode": "96150"
          },
          {
            "name": "รือเสาะออก",
            "postalCode": "96150"
          },
          {
            "name": "โคกสะตอ",
            "postalCode": "96150"
          },
          {
            "name": "สุวารี",
            "postalCode": "96150"
          }
        ]
      },
      {
        "name": "ศรีสาคร",
        "subDistricts": [
          {
            "name": "ซากอ",
            "postalCode": "96210"
          },
          {
            "name": "ตะมะยูง",
            "postalCode": "96210"
          },
          {
            "name": "ศรีสาคร",
            "postalCode": "96210"
          },
          {
            "name": "เชิงคีรี",
            "postalCode": "96210"
          },
          {
            "name": "กาหลง",
            "postalCode": "96210"
          },
          {
            "name": "ศรีบรรพต",
            "postalCode": "96210"
          }
        ]
      },
      {
        "name": "แว้ง",
        "subDistricts": [
          {
            "name": "แว้ง",
            "postalCode": "96160"
          },
          {
            "name": "กายูคละ",
            "postalCode": "96160"
          },
          {
            "name": "ฆอเลาะ",
            "postalCode": "96160"
          },
          {
            "name": "โละจูด",
            "postalCode": "96160"
          },
          {
            "name": "แม่ดง",
            "postalCode": "96160"
          },
          {
            "name": "เอราวัณ",
            "postalCode": "96160"
          }
        ]
      },
      {
        "name": "สุคิริน",
        "subDistricts": [
          {
            "name": "มาโมง",
            "postalCode": "96190"
          },
          {
            "name": "สุคิริน",
            "postalCode": "96190"
          },
          {
            "name": "เกียร์",
            "postalCode": "96190"
          },
          {
            "name": "ภูเขาทอง",
            "postalCode": "96190"
          },
          {
            "name": "ร่มไทร",
            "postalCode": "96190"
          }
        ]
      },
      {
        "name": "สุไหงโก-ลก",
        "subDistricts": [
          {
            "name": "สุไหงโก-ลก",
            "postalCode": "96120"
          },
          {
            "name": "ปาเสมัส",
            "postalCode": "96120"
          },
          {
            "name": "มูโนะ",
            "postalCode": "96120"
          },
          {
            "name": "ปูโยะ",
            "postalCode": "96120"
          }
        ]
      },
      {
        "name": "สุไหงปาดี",
        "subDistricts": [
          {
            "name": "ปะลุรู",
            "postalCode": "96140"
          },
          {
            "name": "สุไหงปาดี",
            "postalCode": "96140"
          },
          {
            "name": "โต๊ะเด็ง",
            "postalCode": "96140"
          },
          {
            "name": "สากอ",
            "postalCode": "96140"
          },
          {
            "name": "ริโก๋",
            "postalCode": "96140"
          },
          {
            "name": "กาวะ",
            "postalCode": "96140"
          }
        ]
      },
      {
        "name": "จะแนะ",
        "subDistricts": [
          {
            "name": "จะแนะ",
            "postalCode": "96220"
          },
          {
            "name": "ดุซงญอ",
            "postalCode": "96220"
          },
          {
            "name": "ผดุงมาตร",
            "postalCode": "96220"
          },
          {
            "name": "ช้างเผือก",
            "postalCode": "96220"
          }
        ]
      },
      {
        "name": "เจาะไอร้อง",
        "subDistricts": [
          {
            "name": "จวบ",
            "postalCode": "96130"
          },
          {
            "name": "บูกิต",
            "postalCode": "96130"
          },
          {
            "name": "มะรือโบออก",
            "postalCode": "96130"
          }
        ]
      }
    ]
  }
];

export const ALL_THAI_PROVINCES = [
  "กรุงเทพมหานคร",
  "สมุทรปราการ",
  "นนทบุรี",
  "ปทุมธานี",
  "พระนครศรีอยุธยา",
  "อ่างทอง",
  "ลพบุรี",
  "สิงห์บุรี",
  "ชัยนาท",
  "สระบุรี",
  "ชลบุรี",
  "ระยอง",
  "จันทบุรี",
  "ตราด",
  "ฉะเชิงเทรา",
  "ปราจีนบุรี",
  "นครนายก",
  "สระแก้ว",
  "นครราชสีมา",
  "บุรีรัมย์",
  "สุรินทร์",
  "ศรีสะเกษ",
  "อุบลราชธานี",
  "ยโสธร",
  "ชัยภูมิ",
  "อำนาจเจริญ",
  "บึงกาฬ",
  "หนองบัวลำภู",
  "ขอนแก่น",
  "อุดรธานี",
  "เลย",
  "หนองคาย",
  "มหาสารคาม",
  "ร้อยเอ็ด",
  "กาฬสินธุ์",
  "สกลนคร",
  "นครพนม",
  "มุกดาหาร",
  "เชียงใหม่",
  "ลำพูน",
  "ลำปาง",
  "อุตรดิตถ์",
  "แพร่",
  "น่าน",
  "พะเยา",
  "เชียงราย",
  "แม่ฮ่องสอน",
  "นครสวรรค์",
  "อุทัยธานี",
  "กำแพงเพชร",
  "ตาก",
  "สุโขทัย",
  "พิษณุโลก",
  "พิจิตร",
  "เพชรบูรณ์",
  "ราชบุรี",
  "กาญจนบุรี",
  "สุพรรณบุรี",
  "นครปฐม",
  "สมุทรสาคร",
  "สมุทรสงคราม",
  "เพชรบุรี",
  "ประจวบคีรีขันธ์",
  "นครศรีธรรมราช",
  "กระบี่",
  "พังงา",
  "ภูเก็ต",
  "สุราษฎร์ธานี",
  "ระนอง",
  "ชุมพร",
  "สงขลา",
  "สตูล",
  "ตรัง",
  "พัทลุง",
  "ปัตตานี",
  "ยะลา",
  "นราธิวาส"
];
