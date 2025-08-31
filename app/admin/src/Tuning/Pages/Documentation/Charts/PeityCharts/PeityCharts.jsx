import React from 'react'

import CommonPieChart from './Components/CommonPieChart'
import CommonBarChart from './Components/CommonBarChart'
import CommonLineChart from './Components/CommonLineChart'
import { Link } from 'react-router-dom'

const PeityCharts = () => {
  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
            <div className="card-body p-0">
                <h4 className="mb-4">Peity Charts</h4>
                <div className="row g-3">
                    <div className="col-12">
                        <h5>How it works</h5>
                        <p className="lead">Peity (sounds like deity) is a plugin that converts an element's content into a mini <code>svg</code> pie, donut, line or bar chart. <Link to="http://benpickles.github.io/peity/">Peity Chart</Link></p>
                    </div>
                    <div className="col-12">
                        <h5 className="card-title">Pie Charts</h5>
                        <div className="d-flex">
                            <span className='me-1'><CommonPieChart className='' data={1} total={5} /></span>
                            <span className='me-1'><CommonPieChart className='' data={226} total={360} /></span>
                            <span className='me-1'><CommonPieChart className='' data={0.52} total={1.561} /></span>
                            <span className='me-1'><CommonPieChart className='' data={1} total={4} /></span>
                            <span className='me-1'><CommonPieChart className='' data={226} total={134} /></span>
                            <span className='me-1'><CommonPieChart className='' data={0.52} total={1.041} /></span>
                            <span className='me-1'><CommonPieChart className='' data={1} total={2.5} /></span>
                        </div>
                        <div className="language-html m-0 rounded-4 mt-5" data-lang="html">
                            <pre className='h6 text-black'><code>**HTML**</code></pre>
                            <pre className='h6 text-primary'><code>&lt;span className=&quot;pie&quot;&gt;1/5&lt;/span&gt;</code></pre>
                        </div>
                        <div className="language-html m-0 rounded-4 mt-5" data-lang="html">
                            <pre className='h6 text-black'><code>**JavaScript**</code></pre>
                            <pre className='h6 text-primary'><code>&lt;CommonPieChart className='pie' data={1} total={5} /&gt;</code></pre>
                        </div>
                    </div>
                    <div className="col-12">
                        <h5 className="card-title fw-normal mb-0">Line Charts</h5>
                        <span className='me-1'><CommonLineChart className='line' data={[5, 3, 9, 6, 5, 9, 7, 3, 5, 2]} /></span>
                        <span className='me-1'><CommonLineChart className='line' data={[5,3,2,-1,-3,-2,2,3,5,2]} /></span>
                        <span className='me-1'><CommonLineChart className='line' data={[-1,-3,-6,-4,-5,-4,-7,-3,-5,-2]} /></span>
                        <div className="language-html m-0 rounded-4 mt-5" data-lang="html">
                            <pre className='h6 text-black'><code>**HTML**</code></pre>
                            <pre className='h6 text-primary'><code>&lt;span className=&quot;line&quot;&gt;5,3,9,6,5,9,7,3,5,2&lt;/span&gt;</code></pre>
                        </div>
                        <div className="language-html m-0 rounded-4 mt-5" data-lang="html">
                            <pre className='h6 text-black'><code>**JavaScript**</code></pre>
                            <pre className='h6 text-primary'><code>{`<CommonLineChart className='line' data={[5, 3, 9, 6, 5, 9, 7, 3, 5, 2]} />`}</code></pre>
                        </div>
                    </div>
                    <div className="col-12">
                        <h5 className="card-title fw-normal mb-0">Bar Charts</h5>
                        <span className='me-1'><CommonBarChart className='bar' data={[5, 3, 9, 6, 5, 9, 7, 3, 5, 2]} /></span>
                        <span className='me-1'><CommonBarChart className='bar' data={[5, 8, 9, 4]} /></span>
                        <span className='me-1'><CommonBarChart className='bar' data={[8, 9, 10, 5, 4, 3, 2, 1]} /></span>
                        <div className="language-html m-0 rounded-4 mt-5" data-lang="html">
                            <pre className='h6 text-black'><code>**HTML**</code></pre>
                            <pre className='h6 text-primary'><code>&lt;span className=&quot;bar&quot;&gt;5,3,9,6,5,9,7,3,5,2&lt;/span&gt;</code></pre>
                        </div>
                        <div className="language-html m-0 rounded-4 mt-5" data-lang="html">
                            <pre className='h6 text-black'><code>**JavaScript**</code></pre>
                            <pre className='h6 text-primary'><code>{`<CommonBarChart className='bar' data={[5, 3, 9, 6, 5, 9, 7, 3, 5, 2]} />`}</code></pre>
                        </div>
                    </div>
                </div>
            </div>
		</div>
    )
}

export default PeityCharts