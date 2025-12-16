import { useState } from 'react';
import Navbar from '../components/organisms/Navbar';
import { Card, Text } from '../components/atoms';
import { CollapsibleSection } from '../components/molecules';
import { IoBook, IoHelp, IoMap, IoCloudUpload, IoLayers, IoPeople } from 'react-icons/io5';

const Docs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <IoBook className="text-3xl text-orange-600" />
            <Text variant="h2" color="primary">คู่มือการใช้งาน</Text>
          </div>
          <Text color="secondary">
            เอกสารแนะนำการใช้งานระบบภูมิสารสนเทศชุมชน (LGIA)
          </Text>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <Card variant="outline" padding="lg" className="sticky top-4">
              <Text variant="h5" className="mb-4">เนื้อหา</Text>
              <nav className="space-y-2">
                <a href="#intro" className="block text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  1. เกี่ยวกับระบบ
                </a>
                <a href="#login" className="block text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  2. การเข้าสู่ระบบ
                </a>
                <a href="#map" className="block text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  3. การใช้งานแผนที่
                </a>
                <a href="#upload" className="block text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  4. การนำเข้าข้อมูล
                </a>
                <a href="#create" className="block text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  5. การสร้างชั้นข้อมูล
                </a>
                <a href="#manage" className="block text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  6. การจัดการข้อมูล
                </a>
                <a href="#users" className="block text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  7. การจัดการผู้ใช้
                </a>
                <a href="#faq" className="block text-sm text-gray-600 hover:text-orange-600 transition-colors">
                  8. คำถามที่พบบ่อย
                </a>
              </nav>
            </Card>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Introduction */}
            <Card variant="default" padding="lg" id="intro">
              <Text variant="h3" className="mb-4">1. เกี่ยวกับระบบ LGIA</Text>
              <div className="space-y-3 text-gray-700">
                <Text>
                  ระบบภูมิสารสนเทศชุมชน (LGIA - Local Geo-Info Application) เป็นระบบจัดการข้อมูลเชิงพื้นที่
                  สำหรับองค์กรปกครองส่วนท้องถิ่น ช่วยในการจัดเก็บ จัดการ และแสดงผลข้อมูลภูมิศาสตร์
                </Text>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Text size="sm" weight="medium" className="mb-2">ฟีเจอร์หลัก:</Text>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    <li>แสดงผลแผนที่โต้ตอบ (Interactive Map)</li>
                    <li>จัดการชั้นข้อมูลภูมิศาสตร์</li>
                    <li>นำเข้าข้อมูลจากไฟล์ CSV</li>
                    <li>สร้างรายงานและสถิติ</li>
                    <li>ระบบจัดการผู้ใช้และสิทธิ์</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Login Guide */}
            <Card variant="default" padding="lg" id="login">
              <Text variant="h3" className="mb-4">2. การเข้าสู่ระบบ</Text>
              <div className="space-y-3">
                <CollapsibleSection title="ขั้นตอนการเข้าสู่ระบบ" defaultOpen>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                    <li>เปิดเว็บเบราว์เซอร์ และเข้าไปที่ URL ของระบบ</li>
                    <li>คลิกปุ่ม "เข้าสู่ระบบ" ที่มุมบนขวา</li>
                    <li>กรอกชื่อผู้ใช้และรหัสผ่าน</li>
                    <li>คลิกปุ่ม "เข้าสู่ระบบ"</li>
                  </ol>
                </CollapsibleSection>

                <CollapsibleSection title="บัญชีผู้ใช้ทดสอบ">
                  <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                    <Text size="sm">ชื่อผู้ใช้: <code className="bg-gray-200 px-2 py-1 rounded">test</code></Text>
                    <Text size="sm">รหัสผ่าน: <code className="bg-gray-200 px-2 py-1 rounded">test1234</code></Text>
                    <Text size="sm" color="secondary">สิทธิ์: ผู้ใช้ทั่วไป (User)</Text>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="สิทธิ์ผู้ใช้">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Admin</span>
                      <Text size="sm" color="secondary">สิทธิ์เต็มทุกฟังก์ชัน รวมถึงจัดการผู้ใช้</Text>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Editor</span>
                      <Text size="sm" color="secondary">สร้าง แก้ไข และจัดการข้อมูล</Text>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">User</span>
                      <Text size="sm" color="secondary">ดูข้อมูลและรายงานเท่านั้น</Text>
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            </Card>

            {/* Map Usage */}
            <Card variant="default" padding="lg" id="map">
              <div className="flex items-center gap-2 mb-4">
                <IoMap className="text-2xl text-orange-600" />
                <Text variant="h3">3. การใช้งานแผนที่</Text>
              </div>
              <div className="space-y-3">
                <CollapsibleSection title="การนำทางแผนที่" defaultOpen>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                    <li>ซูมเข้า/ออก: ใช้ปุ่ม + และ - หรือล้อเมาส์</li>
                    <li>เลื่อนแผนที่: คลิกค้างและลากเมาส์</li>
                    <li>ดูข้อมูล: คลิกที่จุดบนแผนที่</li>
                  </ul>
                </CollapsibleSection>

                <CollapsibleSection title="การเลือกชั้นข้อมูล">
                  <Text size="sm" color="secondary">
                    ในแถบด้านซ้าย คุณสามารถเลือกชั้นข้อมูลที่ต้องการแสดงบนแผนที่โดยการติ๊กถูกที่ checkbox
                    ชั้นข้อมูลจะถูกจัดกลุ่มตามหน่วยงานต่างๆ
                  </Text>
                </CollapsibleSection>

                <CollapsibleSection title="การกรองข้อมูล">
                  <Text size="sm" color="secondary">
                    ใช้แผงด้านขวาในการกรองข้อมูล โดยเลือกชั้นข้อมูล คอลัมน์ และคำค้นหา
                    ระบบจะแสดงเฉพาะข้อมูลที่ตรงกับเงื่อนไข
                  </Text>
                </CollapsibleSection>
              </div>
            </Card>

            {/* Upload Guide */}
            <Card variant="default" padding="lg" id="upload">
              <div className="flex items-center gap-2 mb-4">
                <IoCloudUpload className="text-2xl text-orange-600" />
                <Text variant="h3">4. การนำเข้าข้อมูลจาก CSV</Text>
              </div>
              <div className="space-y-3">
                <CollapsibleSection title="รูปแบบไฟล์ CSV" defaultOpen>
                  <div className="space-y-2 text-sm text-gray-700">
                    <Text size="sm">ไฟล์ CSV ต้องมีคอลัมน์พื้นฐานดังนี้:</Text>
                    <div className="bg-gray-50 p-3 rounded font-mono text-xs overflow-x-auto">
                      latitude,longitude,name,description<br />
                      18.7883,98.9853,จุดที่ 1,รายละเอียด 1<br />
                      18.7900,98.9900,จุดที่ 2,รายละเอียด 2
                    </div>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection title="ขั้นตอนการอัปโหลด">
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                    <li>ไปที่เมนู "นำเข้าข้อมูลจาก CSV"</li>
                    <li>กรอกชื่อชั้นข้อมูล</li>
                    <li>เลือกหน่วยงาน</li>
                    <li>เลือกประเภทข้อมูล (จุด/เส้น/พื้นที่)</li>
                    <li>คลิกเพื่อเลือกไฟล์ CSV</li>
                    <li>คลิก "อัปโหลดไฟล์"</li>
                  </ol>
                </CollapsibleSection>
              </div>
            </Card>

            {/* Create Layer */}
            <Card variant="default" padding="lg" id="create">
              <div className="flex items-center gap-2 mb-4">
                <IoLayers className="text-2xl text-orange-600" />
                <Text variant="h3">5. การสร้างชั้นข้อมูล</Text>
              </div>
              <div className="space-y-3">
                <Text size="sm" color="secondary">
                  การสร้างชั้นข้อมูลใหม่ช่วยให้คุณกำหนดโครงสร้างข้อมูลที่ต้องการเก็บ
                  เหมาะสำหรับการสร้างฐานข้อมูลที่มีโครงสร้างเฉพาะ
                </Text>

                <CollapsibleSection title="ขั้นตอนการสร้าง" defaultOpen>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                    <li>ไปที่เมนู "สร้างชั้นข้อมูล"</li>
                    <li>กรอกข้อมูลพื้นฐาน (ชื่อ, หน่วยงาน, ประเภท)</li>
                    <li>คลิก "เพิ่มคอลัมน์" เพื่อเพิ่มฟิลด์ข้อมูล</li>
                    <li>กำหนดชื่อและประเภทของแต่ละคอลัมน์</li>
                    <li>ตรวจสอบสรุปข้อมูลด้านขวา</li>
                    <li>คลิก "สร้างชั้นข้อมูล"</li>
                  </ol>
                </CollapsibleSection>

                <CollapsibleSection title="ประเภทข้อมูลที่รองรับ">
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-4">
                    <li>ข้อความ (Text) - สำหรับชื่อ, รายละเอียด</li>
                    <li>จำนวนเต็ม (Integer) - สำหรับจำนวน, รหัส</li>
                    <li>ทศนิยม (Decimal) - สำหรับตัวเลขที่มีทศนิยม</li>
                    <li>วันที่ (Date) - สำหรับบันทึกวันเวลา</li>
                    <li>ใช่/ไม่ใช่ (Boolean) - สำหรับข้อมูลแบบสองทาง</li>
                  </ul>
                </CollapsibleSection>
              </div>
            </Card>

            {/* Manage Data */}
            <Card variant="default" padding="lg" id="manage">
              <Text variant="h3" className="mb-4">6. การจัดการข้อมูล</Text>
              <div className="space-y-3">
                <Text size="sm" color="secondary">
                  หน้าจัดการข้อมูลช่วยให้คุณสามารถแก้ไข อัปเดต และลบข้อมูลในชั้นข้อมูลต่างๆ
                </Text>

                <CollapsibleSection title="การแก้ไขข้อมูล" defaultOpen>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                    <li>เลือกชั้นข้อมูลที่ต้องการแก้ไข</li>
                    <li>คลิกปุ่ม "แก้ไข" ในแถวข้อมูล</li>
                    <li>แก้ไขข้อมูลในฟอร์ม</li>
                    <li>คลิก "บันทึก"</li>
                  </ol>
                </CollapsibleSection>

                <CollapsibleSection title="การลบข้อมูล">
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm">
                    <Text size="sm" weight="medium" className="mb-1">⚠️ ข้อควรระวัง:</Text>
                    <Text size="sm" color="secondary">
                      การลบข้อมูลจะไม่สามารถกู้คืนได้ กรุณาตรวจสอบให้แน่ใจก่อนลบ
                    </Text>
                  </div>
                </CollapsibleSection>
              </div>
            </Card>

            {/* User Management */}
            <Card variant="default" padding="lg" id="users">
              <div className="flex items-center gap-2 mb-4">
                <IoPeople className="text-2xl text-orange-600" />
                <Text variant="h3">7. การจัดการผู้ใช้ (Admin เท่านั้น)</Text>
              </div>
              <div className="space-y-3">
                <div className="bg-red-50 p-3 rounded border border-red-200 text-sm">
                  <Text size="sm">
                    หน้านี้สามารถเข้าถึงได้เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น
                  </Text>
                </div>

                <CollapsibleSection title="การเพิ่มผู้ใช้ใหม่" defaultOpen>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                    <li>ไปที่เมนู "จัดการผู้ใช้"</li>
                    <li>คลิกปุ่ม "เพิ่มผู้ใช้"</li>
                    <li>กรอกข้อมูลผู้ใช้ (ชื่อผู้ใช้, อีเมล, หน่วยงาน)</li>
                    <li>เลือกสิทธิ์การใช้งาน</li>
                    <li>คลิก "บันทึก"</li>
                  </ol>
                </CollapsibleSection>

                <CollapsibleSection title="การแก้ไขสิทธิ์ผู้ใช้">
                  <Text size="sm" color="secondary">
                    คลิกปุ่ม "แก้ไข" ในแถวของผู้ใช้ที่ต้องการเปลี่ยนสิทธิ์
                    จากนั้นเลือกสิทธิ์ใหม่และคลิก "บันทึก"
                  </Text>
                </CollapsibleSection>
              </div>
            </Card>

            {/* FAQ */}
            <Card variant="default" padding="lg" id="faq">
              <div className="flex items-center gap-2 mb-4">
                <IoHelp className="text-2xl text-orange-600" />
                <Text variant="h3">8. คำถามที่พบบ่อย (FAQ)</Text>
              </div>
              <div className="space-y-3">
                <CollapsibleSection title="ลืมรหัสผ่านทำอย่างไร?">
                  <Text size="sm" color="secondary">
                    กรุณาติดต่อผู้ดูแลระบบเพื่อทำการรีเซ็ตรหัสผ่าน
                  </Text>
                </CollapsibleSection>

                <CollapsibleSection title="ไฟล์ CSV ที่อัปโหลดมีปัญหา">
                  <Text size="sm" color="secondary">
                    ตรวจสอบว่าไฟล์เป็น UTF-8 encoding และมีคอลัมน์ latitude, longitude ครบถ้วน
                  </Text>
                </CollapsibleSection>

                <CollapsibleSection title="ไม่สามารถเห็นชั้นข้อมูลบนแผนที่">
                  <Text size="sm" color="secondary">
                    ตรวจสอบว่าได้ติ๊กถูกเลือกชั้นข้อมูลในแถบด้านซ้ายแล้ว
                    และตรวจสอบว่าข้อมูลมีพิกัดที่ถูกต้อง
                  </Text>
                </CollapsibleSection>

                <CollapsibleSection title="ต้องการความช่วยเหลือเพิ่มเติม">
                  <Text size="sm" color="secondary">
                    กรุณาติดต่อทีมพัฒนาระบบหรือผู้ดูแลระบบของคุณ
                  </Text>
                </CollapsibleSection>
              </div>
            </Card>

            {/* Contact */}
            <Card variant="glass" padding="lg" className="text-center">
              <Text variant="h5" className="mb-2">ต้องการความช่วยเหลือ?</Text>
              <Text color="secondary" size="sm">
                ติดต่อทีมสนับสนุน: support@lgia.local
              </Text>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
