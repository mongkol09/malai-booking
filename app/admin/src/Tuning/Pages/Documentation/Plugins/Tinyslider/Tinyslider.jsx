import React, { useEffect } from 'react'
import { Link } from 'react-router-dom';

import {tns} from 'tiny-slider';
import 'tiny-slider/src/tiny-slider.scss'

const Tinyslider = () => {

    useEffect(() => {
        var slider = tns({
            container: '.my-slider',
            slideBy: "page",
            mouseDrag: true,
            swipeAngle: false,
            speed: 2000,
            nav: false,
            autoplay: true,
            controls: false,
            autoplayButtonOutput: false,
            responsive: {
                1024: {
                    items: 3,
                }
            },
        });
    
        return () => {
            slider.destroy();
          };
    }, [])

  const tinyCode = `
  import {tns} from 'tiny-slider';
  import 'tiny-slider/src/tiny-slider.scss'

  useEffect(() => {
    var slider = tns({
      container: '.my-slider',
      slideBy: "page",
      mouseDrag: true,
      swipeAngle: false,
      speed: 2000,
      nav: false,
      autoplay: true,
      controls: false,
      autoplayButtonOutput: false,
      responsive: {
          1024: {
              items: 3,
          }
      },
    });

    return () => {
      slider.destroy();
      };
    }, []);

  return (
    <div className="my-slider mb-4">
      <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color1)"}}><h4>1</h4></div>
      <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color2)"}}><h4>2</h4></div>
      <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color3)"}}><h4>3</h4></div>
    </div>
  )
`;
  return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
			<h4 className="mb-4">Tiny slider</h4>
			<p className="lead">Here's an example of Tiny Slider with custom navigation buttons and a variety of additional options. For more info, please visit the <Link to="http://ganlanyuan.github.io/tiny-slider/demo/"  rel="nofollow" target="_blank">official website</Link>.</p>	
            <div className="row g-3">
                <div className="col-12">
                    <p className="lead">Here's an example of Tiny Slider with custom navigation buttons and a variety of additional options. For more info, please visit the <Link to="http://ganlanyuan.github.io/tiny-slider/demo/" target="_blank">official website</Link>.</p>
                    <div className="my-slider mb-4">
                        <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color1)"}}><h4>1</h4></div>
                        <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color2)"}}><h4>2</h4></div>
                        <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color3)"}}><h4>3</h4></div>
                        <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color4)"}}><h4>4</h4></div>
                        <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color5)"}}><h4>6</h4></div>
                        <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color1)"}}><h4>7</h4></div>
                        <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color2)"}}><h4>8</h4></div>
                        <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color3)"}}><h4>9</h4></div>
                        <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color4)"}}><h4>10</h4></div>
                        <div className="item p-3 text-light" style={{height: "100px", backgroundColor: "var(--theme-color5)"}}><h4>11</h4></div>
                    </div>
                    <div className="rounded-4 " data-lang="html">
                        <pre className='h6 language-html text-primary'><code>{tinyCode}</code></pre>
                    </div>
                </div>
            </div>
		</div>
    )
}

export default Tinyslider