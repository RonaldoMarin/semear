"use client"

import "./index.css"
import Link from "next/link"
import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6"
import Image from "next/image"

export default function Footer() {
  return (
    <footer>
      <div id="footer_content">
        <div id="footer_contacts">
          <Image
            className="logo"
            src="/semear-texto.svg"
            width={210}
            height={100}
            alt="Logo do semear"
          />
          <p>Its all about your dreams</p>

          <div id="footer_social_media">
            <Link href="#" className="footer-link" id="instagram">
              <FaInstagram />
            </Link>
            <Link href="#" className="footer-link" id="facebook">
              <FaFacebookF />
            </Link>
            <Link href="#" className="footer-link" id="whatsapp">
              <FaWhatsapp />
            </Link>
            <Link href="#" className="footer-link" id="youtube">
              <FaYoutube />
            </Link>
          </div>
        </div>

        <ul className="footer-list">
          <li>
            <h3>Blog</h3>
          </li>
          <li>
            <Link href="#" className="footer-link">
              Tech
            </Link>
          </li>
          <li>
            <Link href="#" className="footer-link">
              Adventures
            </Link>
          </li>
          <li>
            <Link href="#" className="footer-link">
              Music
            </Link>
          </li>
        </ul>

        <ul className="footer-list">
          <li>
            <h3>Products</h3>
          </li>
          <li>
            <Link href="#" className="footer-link">
              App
            </Link>
          </li>
          <li>
            <Link href="#" className="footer-link">
              Desktop
            </Link>
          </li>
          <li>
            <Link href="#" className="footer-link">
              Cloud
            </Link>
          </li>
        </ul>
      </div>

      <div id="footer_copyright">&#169; 2024 all rights reserverd</div>
    </footer>
  )
}
