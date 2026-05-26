export type InsightKind = 'prompt' | 'news' | 'tip' | 'workflow'

export type InsightItem = {
  id: string
  kind: InsightKind
  title: string
  description: string
  action: string
}

export const insights: InsightItem[] = [
  {
    id: 'prompt-lesson-plan',
    kind: 'prompt',
    title: 'Prompt สร้างแผนการสอน',
    description:
      'ใช้ AI ช่วยร่างแผนการสอนจากหัวข้อ เวลาเรียน จุดประสงค์ และกิจกรรมในชั้นเรียน.',
    action: 'เปิด Prompt',
  },
  {
    id: 'tip-google-sheets',
    kind: 'tip',
    title: 'เทคนิค Google Sheets',
    description:
      'แยก sheet สำหรับข้อมูลดิบ สรุปผล และ dashboard เพื่อลดความสับสนเวลาทำรายงาน.',
    action: 'ดูเทคนิค',
  },
  {
    id: 'news-canva-ai',
    kind: 'news',
    title: 'Canva AI Update',
    description:
      'ติดตามฟีเจอร์ AI สำหรับทำสื่อการสอน งานนำเสนอ และภาพประกอบให้เร็วขึ้น.',
    action: 'อ่านสรุป',
  },
  {
    id: 'workflow-daily-report',
    kind: 'workflow',
    title: 'Workflow การทำรายงานประจำวัน',
    description:
      'เชื่อม Form, Sheet, Drive folder และ LINE notification ให้เป็นลำดับงานเดียว.',
    action: 'จัด Workflow',
  },
]
