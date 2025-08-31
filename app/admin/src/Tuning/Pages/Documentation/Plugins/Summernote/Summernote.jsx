import React, { useState } from 'react'
import RichTextEditor from '../../../../../Common/RichTextEditor/RichTextEditor';
import { Link } from 'react-router-dom';

const Summernote = () => {
    const [editorValue, setEditorValue] = useState(`
    Hello there,
    <br/>
    <p>The toolbar can be customized and it also supports various callbacks such as <code>oninit</code>, <code>onfocus</code>, <code>onpaste</code> and many more.</p>
    <p>Please try <b>paste some texts</b> here</p>
  `);

    const summernoteCode = `
    import React, { useState } from 'react';
    import RichTextEditor from '../../../../../Common/RichTextEditor/RichTextEditor';

    const [editorValue, setEditorValue] = useState(\`
      Hello there,
      <br/>
      <p>The toolbar can be customized and it also supports various callbacks such as 
      <code>oninit</code>, <code>onfocus</code>, <code>onpaste</code> and many more.</p>
      <p>Please try <b>paste some texts</b> here</p>
    \`);

    return (
      <div className="col-12">
        <div className="summernote">
          <RichTextEditor editorValue={editorValue} setEditorValue={setEditorValue}/>
        </div>
      </div>
    )
  `;
    return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">	
            <h4 className="mb-4">Summernote</h4>
            <p className="lead">The fastest way to get Summernote is to download the precompiled and minified versions of our CSS and JavaScript. No documentation or original source code files are included. For more info, please visit the <Link to="https://summernote.org/"  rel="nofollow" target="_blank">official website</Link>.</p>
            <div className="row g-3">
                <div className="col-12">
                <pre className='h6 language-html text-primary'><code>{summernoteCode}</code></pre>
                </div>
                <div className="col-12">
                    <div className="summernote">
                      <RichTextEditor editorValue={editorValue} setEditorValue={setEditorValue}/>
                    </div>
                </div>
            </div>
		    </div>
    )
}

export default Summernote