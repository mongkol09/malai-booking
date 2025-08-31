import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

import gallery1 from '../../../../../assets/images/gallery/1.jpg';

const Sweetalert2 = () => {

    useEffect(() => {
        document.querySelector('.sa-basic').addEventListener('click', function () {
            Swal.fire({
                title: 'Our First Alert',
                confirmButtonText: 'OK'
            });
        });
        document.querySelector('.sa-title-text').addEventListener('click', function () {
            Swal.fire({
                title: 'The Internet?',
                text: 'That thing is still around?',
                icon: 'question',
                confirmButtonText: 'OK'
            });
        });
        document.querySelector('.sa-title-error').addEventListener('click', function () {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong!',
                footer: '<Link to="">Why do I have this issue?</Link>',
                confirmButtonText: 'OK'
            });
        });
        document.querySelector('.sa-buttons').addEventListener('click', function () {
            Swal.fire({
                title: 'Do you want to save the changes?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Save',
                denyButtonText: "Don't save",
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: 'Saved!',
                        text: '',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                } else if (result.isDenied) {
                    Swal.fire({
                        title: 'Changes are not saved',
                        text: '',
                        icon: 'info',
                        confirmButtonText: 'OK'
                    });
                }
            });
        });
        document.querySelector('.sa-position').addEventListener('click', function () {
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: 'Your work has been saved',
                showConfirmButton: false,
                timer: 1500,
            });
        });
        document.querySelector('.sa-image').addEventListener('click', function () {
            Swal.fire({
                title: 'Sweet!',
                text: 'Modal with a custom image.',
                imageUrl: gallery1,
                imageWidth: 400,
                imageHeight: 200,
                imageAlt: 'Custom image',
                confirmButtonText: 'OK'
            });
        });
        document.querySelector('.sa-autoclose').addEventListener('click', function () {
            let timerInterval;
            Swal.fire({
                title: 'Auto close alert!',
                html: 'I will close in <b></b> milliseconds.',
                timer: 2000,
                timerProgressBar: true,
                didOpen: () => {
                    Swal.showLoading();
                    const b = Swal.getHtmlContainer().querySelector('b');
                    timerInterval = setInterval(() => {
                        b.textContent = Swal.getTimerLeft();
                    }, 100);
                },
                willClose: () => {
                    clearInterval(timerInterval);
                },
            }).then((result) => {
                if (result.dismiss === Swal.DismissReason.timer) {
                    console.log('I was closed by the timer');
                }
            });
        });
        document.querySelector('.sa-ajax').addEventListener('click', function () {
            Swal.fire({
                title: 'Submit your Github username',
                input: 'text',
                inputAttributes: {
                    autocapitalize: 'off',
                },
                showCancelButton: true,
                confirmButtonText: 'Look up',
                showLoaderOnConfirm: true,
                preConfirm: (login) => {
                    return fetch(`//api.github.com/users/${login}`)
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error(response.statusText);
                            }
                            return response.json();
                        })
                        .catch((error) => {
                            Swal.showValidationMessage(`Request failed: ${error}`);
                        });
                },
                allowOutsideClick: () => !Swal.isLoading(),
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: `${result.value.login}'s avatar`,
                        imageUrl: result.value.avatar_url,
                        confirmButtonText: 'OK'
                    });
                }
            });
        });
    }, []);

    const sweetAlertCode = `
  import Swal from 'sweetalert2';

  useEffect(() => {
    document.querySelector('.sa-basic').addEventListener('click', function () {
        Swal.fire({
            title: 'Our First Alert',
            confirmButtonText: 'OK'
        });
    });
  }, []);

  return (
    <button className="btn btn-primary sa-basic">Click me</button>
  )
  `;

    return (
        <div className="content px-xl-5 px-lg-4 px-3 py-3 page-body bg-card">

            <h4 className="mb-4">Sweetalert2</h4>
            <p className="lead">A beautiful, responsive, customizable, accessible (WAI-ARIA) replacement for JavaScript's popup boxes. Zero dependencies.</p>
            <ul className="row g-3 list-unstyled">
                <li className="col-12">
                    <pre className='h6 language-html text-primary'><code>{sweetAlertCode}</code></pre>
                </li>
                <li className="col-lg-6 col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h6>A basic message</h6>
                            <button className="btn btn-primary sa-basic">Click me</button>
                        </div>
                    </div>
                </li>
                <li className="col-lg-6 col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h6>A title with a text under</h6>
                            <button className="btn btn-primary sa-title-text">Click me</button>
                        </div>
                    </div>
                </li>
                <li className="col-lg-6 col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h6>A dialog with three buttons</h6>
                            <button className="btn btn-primary sa-buttons">Click me</button>
                        </div>
                    </div>
                </li>
                <li className="col-lg-6 col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h6>A custom positioned dialog</h6>
                            <button className="btn btn-primary sa-position">Click me</button>
                        </div>
                    </div>
                </li>
                <li className="col-lg-6 col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h6>A message with a custom image</h6>
                            <button className="btn btn-primary sa-image">Click me</button>
                        </div>
                    </div>
                </li>
                <li className="col-lg-6 col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h6>A message with auto close timer</h6>
                            <button className="btn btn-primary sa-autoclose">Click me</button>
                        </div>
                    </div>
                </li>
                <li className="col-lg-6 col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h6>AJAX request example</h6>
                            <button className="btn btn-primary sa-ajax">Click me</button>
                        </div>
                    </div>
                </li>
                <li className="col-lg-6 col-md-12">
                    <div className="card">
                        <div className="card-body">
                            <h6>A modal with a title, an error icon, a text, and a footer</h6>
                            <button className="btn btn-primary sa-title-error">Click me</button>
                        </div>
                    </div>
                </li>
            </ul>

        </div>
    )
}

export default Sweetalert2