// แอบส่งข้อความบอกใน Console ว่า Extension ทำงานแล้ว
console.log("🔥 Extension ARU Timetable โหลดเข้ามาในหน้านี้แล้ว!");

// ตั้งค่าเวลา 08:00 - 18:00
const START_HOUR = 8;
const END_HOUR = 18;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722'];
let colorIndex = 0;
const subjectColors = {};

function timeToMinutes(timeStr) {
    let [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
}

// Regex จับรูปแบบ วัน+เวลา ของ ARU เช่น "ต.(13:00-17:00)"
const TIME_PATTERN = /(จ|อา|อ|ต|พฤ|พ|ศ|ส)\.\(?(\d{1,2}:\d{2})[-–](\d{1,2}:\d{2})\)?/;

// ===================================================
// ค้นหาแถวตารางเรียน: scan <tr> ทั้งหน้า
// กรองเฉพาะแถวที่ col[3] มีรูปแบบเวลา
// ===================================================
function findDataRows() {
    const allRows = Array.from(document.querySelectorAll('tr'));
    return allRows.filter(row => {
        // ลองหา td ที่มี pattern เวลา ในทุก column (ไม่จำกัดแค่ col[3])
        const tds = row.querySelectorAll('td');
        for (let i = 0; i < tds.length; i++) {
            if (TIME_PATTERN.test(tds[i]?.innerText?.trim() || '')) return true;
        }
        return false;
    });
}

function processAndRender() {
    const dataRows = findDataRows();
    console.log("✅ เจอแถวข้อมูลวิชา:", dataRows.length, "แถว");

    if (dataRows.length === 0) return false; // ยังไม่มีข้อมูล

    // ป้องกันสร้างซ้ำ
    if (document.getElementById('aru-visual-schedule')) return true;

    let classes = [];

    dataRows.forEach((row, index) => {
        const tds = row.querySelectorAll('td');

        // หา index ของ column ที่มีเวลา
        let timeColIdx = -1;
        for (let i = 0; i < tds.length; i++) {
            if (TIME_PATTERN.test(tds[i]?.innerText?.trim() || '')) {
                timeColIdx = i;
                break;
            }
        }
        if (timeColIdx < 0) return;

        const subjectFull  = tds[0].innerText.trim();
        const roomDayTime  = tds[timeColIdx].innerText.trim();
        const subjectCodeName = subjectFull.split('\n')[0].trim();

        // ข้ามแถว mega layout (มีคอลัมน์เยอะเกิน = เป็น wrapper row)
        if (tds.length > 8) return;
        // ข้ามแถวซ้ำ: col[0] เป็น group number เช่น "1(1820)" ไม่ใช่รหัสวิชา
        if (/^\d+\(\d+\)/.test(subjectCodeName)) return;

        console.log(`  [${index}] วิชา: "${subjectFull.substring(0, 50)}"`);
        console.log(`  [${index}] ห้อง/วัน/เวลา: "${roomDayTime}"`);


        const match = roomDayTime.match(/(.*?)\s*(จ|อา|อ|ต|พฤ|พ|ศ|ส)\.\(?(\d{1,2}:\d{2})[-–](\d{1,2}:\d{2})\)?/);

        if (match) {
            console.log(`  [${index}] ✅ ห้อง="${match[1].trim()}" วัน="${match[2]}" เวลา=${match[3]}-${match[4]}`);
            const dayRaw = match[2];
            let dayKey = 'Mon';
            if      (dayRaw === 'จ')  dayKey = 'Mon';
            else if (dayRaw === 'อ')  dayKey = 'Tue';
            else if (dayRaw === 'ต')  dayKey = 'Tue';
            else if (dayRaw === 'พฤ') dayKey = 'Thu';
            else if (dayRaw === 'พ')  dayKey = 'Wed';
            else if (dayRaw === 'ศ')  dayKey = 'Fri';
            else if (dayRaw === 'ส')  dayKey = 'Sat';
            else if (dayRaw === 'อา') dayKey = 'Sun';

            if (!subjectColors[subjectCodeName]) {
                subjectColors[subjectCodeName] = colors[colorIndex % colors.length];
                colorIndex++;
            }

            classes.push({
                subject: subjectCodeName,
                room: match[1].trim(),
                day: dayKey,
                start: match[3],
                end: match[4],
                color: subjectColors[subjectCodeName]
            });
        } else {
            console.warn(`  [${index}] ⚠️ Regex ไม่ match: "${roomDayTime}"`);
        }
    });

    console.log("ข้อมูลที่ดึงมาได้:", classes);
    console.log("จำนวนวิชา:", classes.length, "รายการ");

    if (classes.length === 0) return false;

    // สร้าง UI
    const scheduleContainer = document.createElement('div');
    scheduleContainer.id = 'aru-visual-schedule';

    let headerHtml = `<div class="schedule-header"><div class="day-label" style="background:transparent;border:none;"></div>`;
    for (let i = START_HOUR; i <= END_HOUR; i++) {
        headerHtml += `<div class="time-label">${i.toString().padStart(2,'0')}:00</div>`;
    }
    headerHtml += `</div>`;
    scheduleContainer.innerHTML = headerHtml;

    const days = [
        { key: 'Mon', name: 'จันทร์' },
        { key: 'Tue', name: 'อังคาร' },
        { key: 'Wed', name: 'พุธ' },
        { key: 'Thu', name: 'พฤหัสฯ' },
        { key: 'Fri', name: 'ศุกร์' },
        { key: 'Sat', name: 'เสาร์' },
        { key: 'Sun', name: 'อาทิตย์' },
    ];

    days.forEach(day => {
        const todaysClasses = classes.filter(c => c.day === day.key);
        if (todaysClasses.length === 0) return;

        const dayRow = document.createElement('div');
        dayRow.className = 'day-row';
        let html = `<div class="day-label">${day.name}</div><div class="day-grid">`;

        todaysClasses.forEach(cls => {
            const startMin    = timeToMinutes(cls.start) - (START_HOUR * 60);
            const endMin      = timeToMinutes(cls.end)   - (START_HOUR * 60);
            const duration    = endMin - startMin;
            const leftPercent = (startMin / TOTAL_MINUTES) * 100;
            const widthPercent= (duration  / TOTAL_MINUTES) * 100;

            html += `
                <div class="class-block" style="left:${leftPercent}%;width:${widthPercent}%;background-color:${cls.color};">
                    <strong>${cls.subject}</strong>
                    <span>${cls.room}</span>
                    <span>${cls.start} - ${cls.end}</span>
                </div>`;
        });

        html += `</div>`;
        dayRow.innerHTML = html;
        scheduleContainer.appendChild(dayRow);
    });

    // แทรกก่อนตาราง parent ของแถวแรก
    const insertTarget = dataRows[0].closest('table');
    if (insertTarget && insertTarget.parentNode) {
        insertTarget.parentNode.insertBefore(scheduleContainer, insertTarget);
    } else {
        document.body.prepend(scheduleContainer);
    }

    console.log("🎉 วาดตารางใหม่สำเร็จ!");
    return true;
}

// ===================================================
// รันทันที + ใช้ MutationObserver รอ AJAX โหลดเสร็จ
// ===================================================
console.log("🔍 กำลังค้นหาแถวตารางเรียน...");

// ลองรันทันที
if (!processAndRender()) {
    console.log("⏳ ยังไม่เจอข้อมูล รอด้วย MutationObserver...");

    let done = false;
    const observer = new MutationObserver(() => {
        if (done) return;
        if (processAndRender()) {
            done = true;
            observer.disconnect();
            console.log("🔌 MutationObserver ปิดแล้ว");
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // timeout 10 วินาที ถ้ายังไม่เจอก็หยุด
    setTimeout(() => {
        if (!done) {
            observer.disconnect();
            console.warn("⏰ Timeout: ไม่พบข้อมูลตารางเรียนหลังรอ 10 วินาที");
            // debug: แสดง tr ทั้งหมดที่มีอยู่
            document.querySelectorAll('tr').forEach((r,i) => {
                const tds = r.querySelectorAll('td');
                if (tds.length > 0)
                    console.log(`  tr[${i}] cols=${tds.length}:`, tds[0]?.innerText?.trim()?.substring(0,40));
            });
        }
    }, 10000);
}
