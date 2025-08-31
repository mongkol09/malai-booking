import React from 'react'

import { Link } from 'react-router-dom';
import CalendarData from '../../../../Configuration/Components/Tuning/Components/Apps/Components/Calendar/Components/CalendarData';

const ToastUICalendar = () => {

    const calendarCode = `
    import Calendar from 'tui-calendar';
    import 'tui-calendar/dist/tui-calendar.css'; 

    useEffect(() => {
      const calendar = new Calendar('#calendar', {
        defaultView: 'month', 
        taskView: true, 
        template: {
          monthDayname: function(dayname) {
            return '<span className="calendar-week-dayname-name">' + dayname.label + '</span>';
          }
        }
      });
    }, []);

    return (
      <div id="calendar" style={{height: "800px"}}>
    )
  `;

  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<h4 className="mb-4">Calendar</h4>
			<p className="lead">TOAST UI Calendar is A JavaScript schedule calendar that is full featured. Now your service just got the customizable calendar.</p>
			<div className="row g-3">
				<div className="col-12">
					<div className="rounded-4 " data-lang="html">
						<pre className='h6 language-html text-primary'><code>{calendarCode}</code></pre>
					</div>
				</div>
				<div className="col-12">
					<div id="calendar" style={{height: "800px"}}>
						<CalendarData/>
					</div>
				</div>
			</div>
		</div>
    )
}

export default ToastUICalendar