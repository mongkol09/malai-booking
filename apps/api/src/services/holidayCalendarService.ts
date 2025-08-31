// ============================================
// HOLIDAY CALENDAR SERVICE
// ============================================

import { format, parseISO, isSameDay } from 'date-fns';

export interface Holiday {
  date: string; // YYYY-MM-DD format
  name: string;
  type: 'national' | 'religious' | 'royal' | 'special';
  isRecurring: boolean; // For holidays that occur annually
  description?: string;
}

export class HolidayCalendarService {
  // Thai National Holidays 2025
  private static readonly HOLIDAYS_2025: Holiday[] = [
    // New Year
    { date: '2025-01-01', name: 'วันขึ้นปีใหม่', type: 'national', isRecurring: true },
    
    // Makha Bucha Day (varies each year)
    { date: '2025-02-12', name: 'วันมาฆบูชา', type: 'religious', isRecurring: false },
    
    // Chakri Day
    { date: '2025-04-06', name: 'วันพระบาทสมเด็จพระพุทธยอดฟ้าจุฬาโลกมหาราช', type: 'royal', isRecurring: true },
    
    // Songkran Festival
    { date: '2025-04-13', name: 'วันสงกรานต์ วันที่ 1', type: 'national', isRecurring: true },
    { date: '2025-04-14', name: 'วันสงกรานต์ วันที่ 2', type: 'national', isRecurring: true },
    { date: '2025-04-15', name: 'วันสงกรานต์ วันที่ 3', type: 'national', isRecurring: true },
    
    // Labour Day
    { date: '2025-05-01', name: 'วันแรงงานแห่งชาติ', type: 'national', isRecurring: true },
    
    // Coronation Day
    { date: '2025-05-04', name: 'วันฉัตรมงคล', type: 'royal', isRecurring: true },
    
    // Visakha Bucha Day (varies each year)
    { date: '2025-05-12', name: 'วันวิสาขบูชา', type: 'religious', isRecurring: false },
    
    // Royal Ploughing Ceremony (varies each year)
    { date: '2025-05-09', name: 'วันจรดพระนังคัลแรกนาขวัญ', type: 'royal', isRecurring: false },
    
    // Asanha Bucha Day (varies each year)
    { date: '2025-07-10', name: 'วันอาสาฬหบูชา', type: 'religious', isRecurring: false },
    
    // Buddhist Lent Day (varies each year)
    { date: '2025-07-11', name: 'วันเข้าพรรษา', type: 'religious', isRecurring: false },
    
    // HM the Queen's Birthday
    { date: '2025-08-12', name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ', type: 'royal', isRecurring: true },
    
    // HM King Bhumibol Memorial Day
    { date: '2025-10-13', name: 'วันคล้ายวันสวรรคตพระบาทสมเด็จพระปรมินทรมหาภูมิพลอดุลยเดช', type: 'royal', isRecurring: true },
    
    // Chulalongkorn Day
    { date: '2025-10-23', name: 'วันปิยมหาราช', type: 'royal', isRecurring: true },
    
    // HM the King's Birthday
    { date: '2025-12-05', name: 'วันคล้ายวันพระบาทสมเด็จพระปรมินทรมหาภูมิพลอดุลยเดช', type: 'royal', isRecurring: true },
    
    // Constitution Day
    { date: '2025-12-10', name: 'วันรัฐธรรมนูญ', type: 'national', isRecurring: true },
    
    // New Year's Eve
    { date: '2025-12-31', name: 'วันสิ้นปี', type: 'national', isRecurring: true },
    
    // Special Holidays (Long weekends, etc.)
    { date: '2025-08-11', name: 'ชดเชยวันเฉลิมพระชนมพรรษาฯ', type: 'special', isRecurring: false },
    { date: '2025-10-14', name: 'ชดเชยวันคล้ายวันสวรรคตฯ', type: 'special', isRecurring: false },
    { date: '2025-12-30', name: 'ชดเชยวันรัฐธรรมนูญ', type: 'special', isRecurring: false }
  ];

  /**
   * ตรวจสอบว่าวันที่กำหนดเป็นวันหยุดหรือไม่
   */
  static isHoliday(date: Date | string): boolean {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    const dateString = format(targetDate, 'yyyy-MM-dd');
    
    return this.HOLIDAYS_2025.some(holiday => holiday.date === dateString);
  }

  /**
   * ดึงข้อมูลวันหยุดสำหรับวันที่กำหนด
   */
  static getHoliday(date: Date | string): Holiday | null {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    const dateString = format(targetDate, 'yyyy-MM-dd');
    
    return this.HOLIDAYS_2025.find(holiday => holiday.date === dateString) || null;
  }

  /**
   * ตรวจสอบว่าเป็นวันหยุดยาว (Long Weekend)
   */
  static isLongWeekend(date: Date | string): boolean {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    const dayOfWeek = targetDate.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Check if it's Friday and next day is holiday
    if (dayOfWeek === 5) { // Friday
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      return this.isHoliday(nextDay);
    }
    
    // Check if it's Monday and previous day was holiday
    if (dayOfWeek === 1) { // Monday
      const prevDay = new Date(targetDate);
      prevDay.setDate(prevDay.getDate() - 1);
      return this.isHoliday(prevDay);
    }
    
    return false;
  }

  /**
   * ดึงรายการวันหยุดทั้งหมดในเดือนที่กำหนด
   */
  static getHolidaysInMonth(year: number, month: number): Holiday[] {
    const monthString = String(month).padStart(2, '0');
    
    return this.HOLIDAYS_2025.filter(holiday => {
      const [holidayYear, holidayMonth] = holiday.date.split('-');
      return holidayYear === String(year) && holidayMonth === monthString;
    });
  }

  /**
   * ดึงรายการวันหยุดทั้งหมดในช่วงวันที่กำหนด
   */
  static getHolidaysInRange(startDate: Date | string, endDate: Date | string): Holiday[] {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    return this.HOLIDAYS_2025.filter(holiday => {
      const holidayDate = parseISO(holiday.date);
      return holidayDate >= start && holidayDate <= end;
    });
  }

  /**
   * ตรวจสอบว่าเป็นช่วงเทศกาลพิเศษหรือไม่ (เช่น สงกรานต์, ปีใหม่)
   */
  static isFestivalPeriod(date: Date | string): { isFestival: boolean; festivalName?: string } {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    const dateString = format(targetDate, 'yyyy-MM-dd');
    
    // Songkran Festival (April 13-15)
    const songkranDates = ['2025-04-13', '2025-04-14', '2025-04-15'];
    if (songkranDates.includes(dateString)) {
      return { isFestival: true, festivalName: 'เทศกาลสงกรานต์' };
    }
    
    // New Year Period (Dec 29 - Jan 2)
    const newYearDates = ['2025-12-29', '2025-12-30', '2025-12-31', '2025-01-01', '2025-01-02'];
    if (newYearDates.includes(dateString)) {
      return { isFestival: true, festivalName: 'เทศกาลปีใหม่' };
    }
    
    return { isFestival: false };
  }

  /**
   * คำนวณระดับความหยุดยาว (สำหรับ dynamic pricing)
   */
  static getHolidayIntensity(date: Date | string): number {
    const targetDate = typeof date === 'string' ? parseISO(date) : date;
    
    // Check if it's a festival period (highest intensity)
    const festival = this.isFestivalPeriod(targetDate);
    if (festival.isFestival) {
      return 3; // Highest intensity
    }
    
    // Check if it's a national holiday
    const holiday = this.getHoliday(targetDate);
    if (holiday) {
      switch (holiday.type) {
        case 'national': return 2;
        case 'royal': return 2;
        case 'religious': return 1.5;
        case 'special': return 1;
        default: return 1;
      }
    }
    
    // Check if it's a long weekend
    if (this.isLongWeekend(targetDate)) {
      return 1.2;
    }
    
    return 0; // Not a holiday
  }

  /**
   * ดึงรายการวันหยุดทั้งหมดในปี 2025
   */
  static getAllHolidays(): Holiday[] {
    return [...this.HOLIDAYS_2025];
  }
}

export default HolidayCalendarService;
