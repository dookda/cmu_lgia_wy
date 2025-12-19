import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/organisms/Navbar';
import { Card, Text, Button, Select } from '../components/atoms';
import { Spinner, Alert } from '../components/molecules';
import { IoDocumentText, IoDownload, IoPrint, IoBarChart } from 'react-icons/io5';
import { BackButton } from '../components/atoms';

const Report = () => {
  const navigate = useNavigate();
  const [layers, setLayers] = useState([]);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load available layers
    fetch('/api/list_layer', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        const layerOptions = (data || []).map(layer => ({
          value: layer.formid,
          label: `${layer.layername} (${layer.division || 'ทั่วไป'})`
        }));
        setLayers(layerOptions);
      })
      .catch((err) => {
        console.error('Failed to load layers:', err);
        setError('ไม่สามารถโหลดรายการชั้นข้อมูลได้');
      });
  }, []);

  const generateReport = async () => {
    if (!selectedLayer) {
      setError('กรุณาเลือกชั้นข้อมูล');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock report generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setReportData({
        layerId: selectedLayer,
        totalRecords: Math.floor(Math.random() * 1000) + 100,
        lastUpdated: new Date().toLocaleDateString('th-TH'),
        summary: 'รายงานสรุปข้อมูลชั้นข้อมูลที่เลือก'
      });
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการสร้างรายงาน');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    alert('ฟังก์ชันส่งออกรายงาน (จะเชื่อมต่อกับ API)');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <BackButton className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <IoDocumentText className="text-3xl text-orange-600" />
            <Text variant="h2" color="primary">รายงาน</Text>
          </div>
          <Text color="secondary">สร้างและดูรายงานสรุปข้อมูลชั้นข้อมูลต่างๆ</Text>
        </div>

        {/* Report Generation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Options */}
          <div className="lg:col-span-1">
            <Card variant="default" padding="lg">
              <Text variant="h4" className="mb-4">ตัวเลือกรายงาน</Text>

              {error && (
                <Alert variant="error" className="mb-4">
                  {error}
                </Alert>
              )}

              <div className="space-y-4">
                <Select
                  label="เลือกชั้นข้อมูล"
                  options={layers}
                  value={selectedLayer}
                  onChange={(e) => setSelectedLayer(e.target.value)}
                  placeholder="-- เลือกชั้นข้อมูล --"
                  fullWidth
                />

                <Button
                  variant="primary"
                  fullWidth
                  onClick={generateReport}
                  loading={loading}
                  disabled={!selectedLayer || loading}
                >
                  <IoBarChart className="mr-2" />
                  สร้างรายงาน
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Panel - Report Display */}
          <div className="lg:col-span-2">
            <Card variant="default" padding="lg" className="min-h-[500px]">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <Spinner size="lg" message="กำลังสร้างรายงาน..." />
                </div>
              ) : reportData ? (
                <div className="no-print">
                  <div className="flex items-center justify-between mb-6">
                    <Text variant="h3">ผลลัพธ์รายงาน</Text>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePrint}>
                        <IoPrint className="mr-2" />
                        พิมพ์
                      </Button>
                      <Button variant="secondary" size="sm" onClick={handleExport}>
                        <IoDownload className="mr-2" />
                        ส่งออก
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card variant="outline" padding="md">
                        <Text size="sm" color="secondary" className="mb-1">
                          จำนวนข้อมูลทั้งหมด
                        </Text>
                        <Text variant="h3" color="brand">
                          {reportData.totalRecords.toLocaleString()}
                        </Text>
                        <Text size="xs" color="secondary">รายการ</Text>
                      </Card>

                      <Card variant="outline" padding="md">
                        <Text size="sm" color="secondary" className="mb-1">
                          ปรับปรุงล่าสุด
                        </Text>
                        <Text variant="h5" color="primary">
                          {reportData.lastUpdated}
                        </Text>
                      </Card>

                      <Card variant="outline" padding="md">
                        <Text size="sm" color="secondary" className="mb-1">
                          สถานะ
                        </Text>
                        <Text variant="h5" color="success">
                          ใช้งานได้
                        </Text>
                      </Card>
                    </div>

                    {/* Report Content */}
                    <div className="border-t pt-6">
                      <Text variant="h4" className="mb-4">สรุปรายงาน</Text>
                      <Text color="secondary" className="mb-4">
                        {reportData.summary}
                      </Text>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <Text size="sm" color="secondary">
                          ข้อมูลรายละเอียดเพิ่มเติมจะแสดงที่นี่เมื่อเชื่อมต่อกับ API
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <IoDocumentText className="text-6xl text-gray-300 mb-4" />
                  <Text variant="h4" color="secondary" className="mb-2">
                    ยังไม่มีรายงาน
                  </Text>
                  <Text color="secondary">
                    เลือกชั้นข้อมูลและคลิก "สร้างรายงาน" เพื่อเริ่มต้น
                  </Text>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;
