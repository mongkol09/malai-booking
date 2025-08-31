// ============================================
// HOLIDAY MANAGEMENT API SERVICE
// ============================================

class HolidayManagementAPI {
  constructor() {
    this.baseURL = '/api/v1/holidays';
  }

  // Base fetch function with error handling
  async fetchAPI(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      };

      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // ============================================
  // HOLIDAY INFORMATION ENDPOINTS
  // ============================================

  /**
   * Get all holidays for the current year
   */
  async getAllHolidays() {
    return await this.fetchAPI('');
  }

  /**
   * Check if a specific date is a holiday
   * @param {string} date - Date in YYYY-MM-DD format
   */
  async checkHoliday(date) {
    return await this.fetchAPI(`/check/${date}`);
  }

  /**
   * Get holidays for a specific month
   * @param {number} year - Year (2024-2030)
   * @param {number} month - Month (1-12)
   */
  async getHolidaysInMonth(year, month) {
    return await this.fetchAPI(`/month/${year}/${month}`);
  }

  /**
   * Get holidays in a date range
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   */
  async getHolidaysInRange(startDate, endDate) {
    return await this.fetchAPI(`/range?startDate=${startDate}&endDate=${endDate}`);
  }

  /**
   * Test pricing calculation for multiple dates
   * @param {Array} dates - Array of dates in YYYY-MM-DD format
   * @param {string} roomTypeId - Room type UUID
   */
  async testPricingForDates(dates, roomTypeId) {
    return await this.fetchAPI('/test-pricing', {
      method: 'POST',
      body: JSON.stringify({ dates, roomTypeId })
    });
  }

  // ============================================
  // PRICING RULE ENDPOINTS
  // ============================================

  /**
   * Get all pricing rules
   */
  async getPricingRules() {
    return await this.fetchAPI('/../../pricing/rules');
  }

  /**
   * Update a pricing rule
   * @param {string} ruleId - Rule ID
   * @param {Object} ruleData - Updated rule data
   */
  async updatePricingRule(ruleId, ruleData) {
    return await this.fetchAPI(`/../../pricing/rules/${ruleId}`, {
      method: 'PUT',
      body: JSON.stringify(ruleData)
    });
  }

  /**
   * Create a new pricing rule
   * @param {Object} ruleData - New rule data
   */
  async createPricingRule(ruleData) {
    return await this.fetchAPI('/../../pricing/rules', {
      method: 'POST',
      body: JSON.stringify(ruleData)
    });
  }

  /**
   * Delete a pricing rule
   * @param {string} ruleId - Rule ID
   */
  async deletePricingRule(ruleId) {
    return await this.fetchAPI(`/../../pricing/rules/${ruleId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Calculate dynamic pricing for a date
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} roomTypeId - Room type UUID
   */
  async calculateDynamicPricing(date, roomTypeId) {
    return await this.fetchAPI(`/../../pricing/calculate?date=${date}&roomTypeId=${roomTypeId}`);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Format date for API calls
   * @param {Date|string} date - Date to format
   * @returns {string} - Date in YYYY-MM-DD format
   */
  formatDate(date) {
    if (typeof date === 'string') {
      return date.split('T')[0]; // Handle ISO string
    }
    return date.toISOString().split('T')[0];
  }

  /**
   * Get today's date in API format
   * @returns {string} - Today's date in YYYY-MM-DD format
   */
  getTodayDate() {
    return this.formatDate(new Date());
  }

  /**
   * Get date range for next N days
   * @param {number} days - Number of days ahead
   * @returns {Object} - Start and end dates
   */
  getDateRange(days = 30) {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);
    
    return {
      startDate: this.formatDate(start),
      endDate: this.formatDate(end)
    };
  }

  /**
   * Check if date is weekend
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {boolean} - True if weekend
   */
  isWeekend(date) {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  }

  /**
   * Get month name
   * @param {number} month - Month number (1-12)
   * @returns {string} - Month name in Thai
   */
  getMonthName(month) {
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return months[month - 1] || '';
  }

  /**
   * Get day name
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {string} - Day name in Thai
   */
  getDayName(date) {
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const dayOfWeek = new Date(date).getDay();
    return days[dayOfWeek] || '';
  }

  /**
   * Format percentage for display
   * @param {number} percentage - Percentage value
   * @returns {string} - Formatted percentage with + or -
   */
  formatPercentage(percentage) {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage}%`;
  }
}

// Create singleton instance
const holidayAPI = new HolidayManagementAPI();

export default holidayAPI;
