import React, { useState } from 'react'
import RichTextEditor from '../../../Common/RichTextEditor/RichTextEditor'

const AboutUs = () => {
    const [editorValue, setEditorValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log(editorValue);
        setEditorValue('');
    };

  return (
        <div className="px-xl-5 px-lg-4 px-3 py-3 page-body">
            <div className="row mb-3">
                <div className="col-sm-12">
                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <h3 className="fw-bold mb-0">About US</h3>
                    </div>
                </div>
            </div>
            <div className="card-body">
                <div className="card border-0 mb-3">
                    <div className="card-header">
                        <h6 className="card-title mb-0">About Details</h6>  
                    </div>
                    <div className="card-body pt-0">
                        <form className="product-add" onSubmit={handleSubmit}>
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="col-form-label">Write Description</label>
                                    <div>
                                        <RichTextEditor editorValue={editorValue} setEditorValue={setEditorValue}/>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <button type="submit" className="btn btn-primary mt-2">Submit</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AboutUs