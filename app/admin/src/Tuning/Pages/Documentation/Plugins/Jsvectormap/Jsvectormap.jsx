import React, { useEffect } from 'react'

import jsVectorMap from 'jsvectormap';
import 'jsvectormap/dist/maps/world.js';
import 'jsvectormap/dist/jsvectormap.js';
import 'jsvectormap/dist/jsvectormap.css';

const Jsvectormap = () => {

    useEffect(() => {
        const map = new jsVectorMap({
          selector: '#MyMap',
          map: 'world',
          markers: [
            { name: 'Egypt', coords: [26.8206, 30.8025] },
            { name: 'United Kingdom', coords: [55.3781, 3.4360] },
            {
              name: 'United States',
              coords: [37.0902, -95.7129],
              style: { fill: 'red' }
            }
          ],
          lines: [
            {
              from: 'United Kingdom',
              to: 'United States',
              style: {
                stroke: 'red',
              }
            }
          ],
          series: {
            regions: [
              {
                attribute: 'fill',
                legend: {
                  title: 'Some title',
                },
                scale: {
                  myScaleOne: 'var(--theme-color1)',
                  myScaleTwo: 'var(--theme-color2)',
                  myScaleThree: 'var(--theme-color3)',
                },
                values: {
                  CN: 'myScaleTwo',
                  MX: 'myScaleOne',
                  LY: 'myScaleOne',
                  RU: 'myScaleThree',
                }
              }
            ]
          },
          lineStyle: {
            stroke: '#676767',
            strokeWidth: 1.5,
            fill: '#ff5566',
            fillOpacity: 1,
            strokeDasharray: '6 3 6',
            animation: true
          }
        });
      }, []);

    const JsvectorCode = `
    import jsVectorMap from 'jsvectormap';
    import 'jsvectormap/dist/maps/world.js';
    import 'jsvectormap/dist/jsvectormap.js';
    import 'jsvectormap/dist/jsvectormap.css';

    useEffect(() => {
        const map = new jsVectorMap({
            selector: '#MyMap',
            map: 'world',
        })
    }, []);

    return (
        <div id="MyMap" style={{height: "400px"}}></div>
    )
  `;

  return (
      <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
        <div className="card border-0 bg-transparent">
          <div className="card-body p-0">
              <div className="row g-3">
                  <div className="col-12">
                    <h4 className="mb-4">Jsvectormap</h4>
                    <p className="lead">Jsvectormap is a lightweight JavaScript library for creating interactive maps and pretty data visualization..</p>
                    <ul>
                      <li>Interactive map is a powerful tool for presentation.</li>
                      <li>It give the ability to create layers of information that can be shown or hidden at the click of a button on a region or maybe a marker.</li>
                      <li>Data can be quickly updated, and these updates made transparent to users.</li>
                      <li>Zoom functions that allow users to focus on either the details of a particular region, or to gain a quick overview of a wider area.</li>
                    </ul>
                      <div className="rounded-4" data-lang="html">
                          <pre className='h6 language-html text-primary'><code>{JsvectorCode}</code></pre>
                      </div>
                  </div>
                  <div className="col-12">
                    <div id="MyMap" style={{height: "400px"}}></div>
                  </div>
              </div>
          </div>
        </div>
		  </div>
    )
}

export default Jsvectormap