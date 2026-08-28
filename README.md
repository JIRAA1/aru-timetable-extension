# ARU Timetable Visualizer — Chrome Extension

ส่วนเสริม Chrome ที่เปลี่ยนตารางเรียนของมหาวิทยาลัยราชภัฏพระนครศรีอยุธยา (ARU) ให้แสดงเป็น **Visual Timeline** แบบ Timeline แบ่งตามวันและเวลา

## ตัวอย่าง

ก่อน: ตารางเรียนปกติของระบบ  
หลัง: Timeline แสดงคาบเรียนแต่ละวันด้วยสีสันสวยงาม

## วิธีติดตั้ง

1. กด **Code → Download ZIP** แล้วแตกไฟล์
2. เปิด Chrome → พิมพ์ `chrome://extensions/`
3. เปิด **Developer Mode** (มุมขวาบน)
4. กด **Load unpacked** → เลือกโฟลเดอร์ที่แตกออกมา
5. เข้าสู่ระบบที่ [e-student.aru.ac.th](https://e-student.aru.ac.th) → ไปหน้าตารางเรียน

## ไฟล์ในโปรเจกต์

| ไฟล์ | หน้าที่ |
|------|---------|
| `manifest.json` | ตั้งค่า Extension |
| `content.js` | Logic ดึงข้อมูลและสร้าง Timeline |
| `style.css` | ตกแต่ง UI |
| `icons/` | ไอคอน Extension |
