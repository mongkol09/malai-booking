import React from 'react'
import { Link } from 'react-router-dom';

const DocIndex = () => {

    const bootstrapImport = `// Import all of Bootstrap's CSS
@import "~bootstrap/scss/bootstrap";
`;
    const customCssImport = `// Import our custom CSS
import '../src/assets/scss/styles.scss';
`;
    const themeCode = `//Theme color variable
[data-ha="theme-ValenciaRed"] {

    --primary-color: 		#D63B38;
    --accent-color: 		#8467cb;

    --primary-rgb: 			214, 59, 56;
    --accent-rgb: 			132, 103, 203;

    --theme-color1:	 		#da3164;
    --theme-color2: 		#ce3c8d;
    --theme-color3: 		#b152b1;
    --theme-color4: 		#8467cb;
    --theme-color5: 		#9aa9e0;
    --theme-color6: 		#314674;

    --primary-gradient: linear-gradient(-45deg, var(--primary-color), var(--secondary-color));
}
[data-ha="theme-SunOrange"] {

    --primary-color: 		#F7A614;
    --accent-color: 		#006b60;

    --primary-rgb: 			247, 166, 20;
    --accent-rgb: 			0, 107, 96;

    --theme-color1:	 		#F7A614;
    --theme-color2: 		#c25450;
    --theme-color3: 		#ff8982;
    --theme-color4: 		#9e7c50;
    --theme-color5: 		#ffc0b7;
    --theme-color6: 		#2f4858;

    --primary-gradient: linear-gradient(-45deg, var(--primary-color), var(--secondary-color));
}
[data-ha="theme-AppleGreen"] {

    --primary-color: 		#5BC43A;
    --accent-color: 		#006b5f;

    --primary-rgb: 			91, 196, 58;
    --accent-rgb: 			0, 107, 95;

    --theme-color1:	 		#00b864;
    --theme-color2: 		#0097aa;
    --theme-color3: 		#0084bd;
    --theme-color4: 		#004e72;
    --theme-color5: 		#96b0b7;
    --theme-color6: 		#2f4858;

    --primary-gradient: linear-gradient(-45deg, var(--primary-color), var(--secondary-color));
}
[data-ha="theme-CeruleanBlue"] {

    --primary-color: 		#00B8D6;
    --accent-color: 		#00a686;

    --primary-rgb: 			0, 184, 214;
    --accent-rgb: 			0, 166, 134;

    --theme-color1:	 		#00b8d6;
    --theme-color2: 		#8966a4;
    --theme-color3: 		#bf9adb;
    --theme-color4: 		#b2a8b8;
    --theme-color5: 		#96b0b7;
    --theme-color6: 		#00a686;

    --primary-gradient: linear-gradient(-45deg, var(--primary-color), var(--secondary-color));
}
[data-ha="theme-Mariner"] {

    --primary-color: 		#0066FE;
    --accent-color: 		#DEAD00;

    --primary-rgb: 			0, 102, 254;
    --accent-rgb: 			222, 173, 0;

    --theme-color1:	 		#2561BE;
    --theme-color2: 		#d3a518;
    --theme-color3: 		#f26a7f;
    --theme-color4: 		#002878;
    --theme-color5: 		#858fbb;
    --theme-color6: 		#5b9591;

    --primary-gradient: linear-gradient(-45deg, var(--primary-color), var(--secondary-color));
}
[data-ha="theme-PurpleHeart"] {
    --primary-color: 	#4C3575;
    --accent-color: 	#e05170;

    --primary-rgb: 		76, 53, 117;
    --accent-rgb: 		224, 81, 112;

    --theme-color1:	 	#4C3575;
    --theme-color2: 	#354175;
    --theme-color3: 	#98427e;
    --theme-color4: 	#d55a75;
    --theme-color5: 	#fb8665;
    --theme-color6: 	#d19a8b;

    --primary-gradient: linear-gradient(145deg, var(--primary-color), var(--accent-color));

    .page-header .header-right>li > a,
    .page-header .header-right>li > div > a{
    color: var(--white-color) !important;
    }
}
[data-ha="theme-FrenchRose"] {

    --primary-color: 		#EB5393;
    --accent-color: 		#4d74c9;

    --primary-rgb: 			235, 83, 147;
    --accent-rgb: 			77, 116, 201;

    --theme-color1:	 		#c82f75;
    --theme-color2: 		#4d74c9;
    --theme-color3: 		#5bbab5;
    --theme-color4: 		#b861c2;
    --theme-color5: 		#ddd7c6;
    --theme-color6: 		#765a76;

    --primary-gradient: linear-gradient(-45deg, var(--primary-color), var(--secondary-color));
}
`;

  return (
    <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">
        <div className="row">
            <div className="col-12">
                <div className="card">
                    <div className="card-header">
                        <h4 id="GettingStarted">Getting Started</h4>
                    </div>
                    <div className="card-body">
                       
                        <p className="lead">Malai is carefully well thought UI frame work that is built on top of React & Bootstrap5, This part of the doc will help you to quickly start your project and will you a basic idea about how Malai work.</p>
                        
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="border-top pt-4 mt-4"></div>
                <div className="card">
                    <div className="card-header">
                        <h4 id="Installation">Installation</h4>
                    </div>
                    <div className="card-body">
                        <p>To set up a project with React</p>
                        <ol>
                            <li><p>Create a project folder and setup npm. We’ll create the my-project folder and initialize npm with the -y argument to avoid it asking us all the interactive questions.</p></li>
                            <li><p><strong>Install NPM </strong> Unlike our Webpack guide, there’s only a single build tool dependency here. We use --save-dev to signal that this dependency is only for development use and not for production.</p><pre className="h6 language-html text-primary"><code className="language-sh" data-lang="sh">npm i </code></pre></li>
                            <li><p><strong>Npm Run Start</strong> Project Run In Local Apply command</p><pre className="h6 language-html text-primary"><code className="language-sh" data-lang="sh">npm run Start</code></pre></li>
                            <li><p><strong>Npm Run Build</strong> Project Code Build Apply this command and upload in to server to build folder code</p><pre className="h6 language-html text-primary"><code className="language-sh" data-lang="sh">npm run build</code></pre></li>
                        </ol>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="border-top pt-4 mt-4"></div>
                <div className="card">
                    <div className="card-header">
                        <h4 id="FolderStructure">Project structure</h4>
                    </div>
                    <div className="card-body">
                    <ul className="list-unstyled">
                        <li className="text-danger"><span style={{minWidth: "120px", display: "inlineBlock"}}>node_modules</span> <small className="text-muted d-none d-lg-inline-block">( NPM dependencies (by default the folder is not included) <code>npm</code> installs dependencies. )</small></li>
                        <li>src
                            <ul className="border-start">
                                <li>assets
                                    <ul className="border-start">
                                        <li>fonts</li>
                                        <li>images</li>
                                        <li>scss</li>
                                    </ul>
                                </li>
                                <li>Common</li>
                                <li>Layout
                                    <ul className="border-start">
                                        <li>AdminLayout</li>
                                        <li>AuthLayout</li>
                                    </ul>
                                </li>
                                <li className="text-danger">Partials
                                    <ul className="border-start">
                                        <li className="text-primary">MyProfile</li>
                                        <li className="text-primary">Reports</li>
                                        <li className="text-primary">RoomsSettings</li>
                                        <li className="text-primary">Universal</li>
                                    </ul>
                                </li>
                                <li className="text-danger">Hrms
                                    <ul className="border-start">
                                        <li className="text-primary">Employees</li>
                                        <li className="text-primary">PayRoll</li>
                                        <li className="text-primary">Usual</li>
                                    </ul>
                                </li>
                                <li className="text-danger">Tuning
                                    <ul className="border-start">
                                        <li className="text-primary">Application</li>
                                        <li className="text-primary">Configuration</li>
                                        <li className="text-primary">FrontPages</li>
                                        <li className="text-primary">Pages</li>
                                        <li className="text-primary">RoleManagement</li>
                                    </ul>
                                </li>
                                <li>Redux</li>
                                <li>App.jsx</li>
                                <li className="text-primary"><Link to="../index" target="_blank">index.js</Link></li>
                                <li>Routes.jsx</li>
                            </ul>
                        </li>
                        <li>.gitignore</li>
                        <li>package.json</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="border-top pt-4 mt-4"></div>
                <div className="card">
                    <div className="card-header">
                        <h4 id="Configurations">Theme Configurations</h4>
                    </div>
                    <div className="card-body">
                    <p>Theme color scss file path: <code>malai/src/assets/global/_themes.scss</code> you can change as per your project/client requirements.</p>
                    <p>Theme light/dark version you can changes in HTML tage <code>data-bs-theme="light"</code>, <code>data-bs-theme="dark"</code></p>
                    <ul className="list-unstyled d-flex flex-wrap">
                        <li className="bg-primary p-4 flex-grow-1 text-white">
                            .bg-primary
                        </li>
                        <li className="bg-accent p-4 flex-grow-1 text-white">
                            .bg-accent
                        </li>
                    </ul>
                    <ul className="list-unstyled d-flex flex-wrap">
                        <li className="theme-color1 p-4 text-white flex-fill">
                            .theme-color1
                        </li>
                        <li className="theme-color2 p-4 text-white flex-fill">
                            .theme-color2
                        </li>
                        <li className="theme-color3 p-4 text-white flex-fill">
                            .theme-color3
                        </li>
                        <li className="theme-color4 p-4 text-white flex-fill">
                            .theme-color4
                        </li>
                        <li className="theme-color5 p-4 text-white flex-fill">
                            .theme-color5
                        </li>
                        <li className="theme-color6 p-4 text-white flex-fill">
                            .theme-color6
                        </li>
                    </ul>
                    <pre className='h6 language-html text-primary'><code  className="language-sh" data-lang="sh">{themeCode}</code></pre>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="border-top pt-4 mt-4"></div>
                <div className="card">
                    <div className="card-header">
                        <h4>Malai Template References</h4>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                                <table className="table table-hover">
                                    <tbody>
                                        <tr>
                                            <td>Google font</td>
                                            <td><Link to="https://fonts.google.com/">https://fonts.google.com/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>Bootstrap</td>
                                            <td><Link to="https://v5.getbootstrap.com/">https://v5.getbootstrap.com/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>SASS</td>
                                            <td><Link to="https://sass-lang.com/">https://sass-lang.com/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>NPM</td>
                                            <td><Link to="https://www.npmjs.com/">https://www.npmjs.com/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>Tabler Icon</td>
                                            <td><Link to="https://tabler.io/">https://tabler.io/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>Datatables</td>
                                            <td><Link to="https://datatables.net/">https://datatables.net/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>Apex Charts</td>
                                            <td><Link to="https://apexcharts.com/">https://apexcharts.com/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>Peity Chart</td>
                                            <td><Link to="https://benpickles.github.io/peity/">https://benpickles.github.io/peity/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>Fullcalendar</td>
                                            <td><Link to="https://fullcalendar.io/">https://fullcalendar.io/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>Pexels</td>
                                            <td><Link to="https://www.pexels.com/">https://www.pexels.com/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>Flatpickr</td>
                                            <td><Link to="https://flatpickr.js.org/">https://flatpickr.js.org/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>Tagify</td>
                                            <td><Link to="https://yaireo.github.io/tagify/">https://yaireo.github.io/tagify/</Link></td>
                                        </tr>
                                        <tr>
                                            <td>Quill Editer</td>
                                            <td><Link to="https://www.npmjs.com/package/quill">https://www.npmjs.com/package/quill</Link></td>
                                        </tr>
                                    </tbody>
                                </table>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-12">
                <div className="border-top pt-4 mt-4"></div>
                <h4 id="Thankyou">Thank you!</h4>
                <div className="py-3">
                    <p className="lead">All the important stuff –&nbsp;compiling the source, file structure, build tools, file includes –&nbsp;is documented here, but should you have any questions, always feel free to reach out to <span className="text-primary fw-bold">pixelwibes@gmail.com</span></p>
                    <p className="lead">If you really like our work, design, performance and support then <Link to="https://themeforest.net/downloads"> please don't forgot to rate us</Link> on Themeforest, it really motivate us to provide something better. <span className="ms-2">
                        <i className="fa fa-star text-warning me-1"></i>
                        <i className="fa fa-star text-warning me-1"></i>
                        <i className="fa fa-star text-warning me-1"></i>
                        <i className="fa fa-star text-warning me-1"></i>
                        <i className="fa fa-star text-warning"></i>
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div> 
  )
}

export default DocIndex