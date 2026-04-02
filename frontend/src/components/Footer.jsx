import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">RN</div>
            <div>
              <h4 className="text-lg font-semibold text-dark">RoomNest</h4>
              <p className="text-sm text-secondary">Rooms & rentals for students and professionals.</p>
            </div>
          </div>

          <p className="text-sm text-secondary mt-4">Safe listings · Verified hosts · Quick messaging</p>
        </div>

        <div className="flex justify-between md:justify-center">
          <div>
            <h5 className="text-sm font-semibold text-dark mb-3">Company</h5>
            <ul className="space-y-2 text-sm text-secondary">
              <li><a href="/about" className="hover:text-dark">About</a></li>
              <li><a href="/careers" className="hover:text-dark">Careers</a></li>
              <li><a href="/blog" className="hover:text-dark">Blog</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-sm font-semibold text-dark mb-3">Support</h5>
            <ul className="space-y-2 text-sm text-secondary">
              <li><a href="/help" className="hover:text-dark">Help Center</a></li>
              <li><a href="/terms" className="hover:text-dark">Terms</a></li>
              <li><a href="/privacy" className="hover:text-dark">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-semibold text-dark mb-3">Stay in the loop</h5>
          <p className="text-sm text-secondary mb-3">Get updates about new rooms and offers.</p>
          <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
            <input type="email" placeholder="Your email" aria-label="Email" className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
            <button className="bg-primary text-white px-4 py-2 rounded-md text-sm">Subscribe</button>
          </form>

          <div className="flex items-center gap-3 mt-4">
            <a href="https://github.com" aria-label="GitHub" className="text-gray-600 hover:text-dark"><FaGithub /></a>
            <a href="https://twitter.com" aria-label="Twitter" className="text-gray-600 hover:text-dark"><FaTwitter /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn" className="text-gray-600 hover:text-dark"><FaLinkedin /></a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-secondary">
          <div>© {new Date().getFullYear()} RoomNest. All rights reserved.</div>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <a href="/contact" className="hover:text-dark">Contact</a>
            <a href="/safety" className="hover:text-dark">Safety</a>
            <a href="/faq" className="hover:text-dark">FAQ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
