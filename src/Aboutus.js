import React from "react";
import { BsArrowDown } from "react-icons/bs";
import { FaTruck, FaExchangeAlt, FaPercent, FaUserClock } from 'react-icons/fa';
import { Carousel } from 'react-bootstrap';
import "./Aboutus.css";

function Aboutus() {
    const scrollToMission = (e) => {
        e.preventDefault();
        const missionElement = document.getElementById("mission");
        missionElement.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
            <section className="about-section py-5">
                <div className="container">
                    <div className="row g-4">
                        <div className="col-lg-6">
                            <div
                                className="content-wrapper h-100 p-5"
                                style={{
                                    backgroundColor: "rgb(172, 203, 238)",
                                    borderRadius: "10px"
                                }}
                            >
                                <div className="content-box">
                                    <h2 className="display-6 fw-bold mb-4">
                                        Cartzilla - More than a retailer
                                    </h2>
                                    <p className="lead text-muted mb-4">
                                        Since 2015, we have been fulfilling the small dreams and big plans of millions of people.
                                        You can find literally everything here.
                                    </p>
                                    <a
                                        className="btn btn-lg btn-outline-dark"
                                        href="#mission"
                                        onClick={scrollToMission}
                                        style={{
                                            border: "2px solid #000",
                                            color: "rgb(3, 8, 15)",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        See more
                                        <BsArrowDown className="bounce-arrow ms-2 fs-5" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6">
                            <div
                                className="image-wrapper h-100"
                                style={{
                                    borderRadius: "10px",
                                    overflow: "hidden"
                                }}
                            >
                                <img
                                    src="pc.png"
                                    alt="Team collaboration"
                                    className="w-100 h-100"
                                    style={{
                                        objectFit: "cover",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="mission" className="services-section py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-normal mb-3">Our Services</h2>
                        <p className="text-muted">
                            Quality components – Build a standard PC to assemble according to your needs. <br>
                            </br>High quality, top performance, dedicated support.
                        </p>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-6 col-lg-3">
                            <div className="service-card">
                                <div className="icon-wrapper">
                                    <FaTruck className="service-icon" />
                                </div>
                                <h3 className="service-title">Delivery Services</h3>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="service-card">
                                <div className="icon-wrapper">
                                    <FaExchangeAlt className="service-icon" />
                                </div>
                                <h3 className="service-title">Shipping & Return</h3>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="service-card">
                                <div className="icon-wrapper">
                                    <FaPercent className="service-icon" />
                                </div>
                                <h3 className="service-title">Promotion</h3>
                            </div>
                        </div>
                        <div className="col-md-6 col-lg-3">
                            <div className="service-card">
                                <div className="icon-wrapper">
                                    <FaUserClock className="service-icon" />
                                </div>
                                <h3 className="service-title">24 Hours Service</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="brands-section py-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-5 fw-normal mb-3">Our Brands</h2>
                        <p className="text-muted">
                            Quality components – Build a standard PC to assemble according to your needs. <br />
                            High quality, top performance, dedicated support.
                        </p>
                    </div>
                    <div className="brands-carousel">
                        <Carousel
                            controls={true}
                            indicators={false}
                            interval={3000}
                            pause="hover"
                        >
                            <Carousel.Item>
                                <div className="row">
                                    <div className="col-3">
                                        <a href="#">
                                            <img className="brand-img" src="intel.png" alt="Intel Logo" />
                                        </a>
                                    </div>
                                    <div className="col-3">
                                        <a href="#">
                                            <img className="brand-img" src="Ryzen.png" alt="Ryzen Logo" />
                                        </a>
                                    </div>
                                    <div className="col-3">
                                        <a href="#">
                                            <img className="brand-img" src="ASUS.png" alt="ASUS Logo" />
                                        </a>
                                    </div>
                                    <div className="col-3">
                                        <a href="#">
                                            <img className="brand-img" src="Gigabyte.png" alt="Gigabyte Logo" />
                                        </a>
                                    </div>
                                </div>
                            </Carousel.Item>
                            <Carousel.Item>
                                <div className="row">
                                    <div className="col-3">
                                        <a href="#">
                                            <img className="brand-img" src="MSI.png" alt="MSI Logo" />
                                        </a>
                                    </div>
                                    <div className="col-3">
                                        <a href="#">
                                            <img className="brand-img" src="NVIDIA.png" alt="NVIDIA Logo" />
                                        </a>
                                    </div>
                                    <div className="col-3">
                                        <a href="#">
                                            <img className="brand-img" src="corsair.png" alt="Corsair Logo" />
                                        </a>
                                    </div>
                                    <div className="col-3">
                                        <a href="#">
                                            <img className="brand-img" src="intel.png" alt="Intel Logo" />
                                        </a>
                                    </div>
                                </div>
                            </Carousel.Item>
                        </Carousel>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Aboutus;
