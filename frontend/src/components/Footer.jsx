import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-[#0a0a0a] text-white mt-12">

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">

                    {/* Logo + Contact under NewsScope */}
                    <div>
                        <Link to="/" className="inline-block">
                            <h2 className="text-3xl font-black tracking-tight">
                                NewsScope
                            </h2>
                        </Link>
                        <p className="text-gray-400 text-sm mt-3">
                            See every side of the story.
                        </p>

                        {/* Contact with mail icon under NewsScope */}
                        <a href="mailto:support@newsscope.com" className="flex items-center gap-2 mt-4 text-sm text-gray-400 hover:text-white transition group">
                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="group-hover:underline underline-offset-4">support@newsscope.com</span>
                        </a>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold mb-4">
                            Company
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link to="/about" className="hover:text-white">
                                    About
                                </Link>
                            </li>
                            <li>
                                <Link to="/mission" className="hover:text-white">
                                    Mission
                                </Link>
                            </li>
                            <li>
                                <Link to="/blog" className="hover:text-white">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h3 className="font-semibold mb-4">
                            Help
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link to="/help" className="hover:text-white">
                                    Help Center
                                </Link>
                            </li>
                            <li>
                                <Link to="/faq" className="hover:text-white">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link to="/sources" className="hover:text-white">
                                    Sources
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold mb-4">
                            Legal
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>
                                <Link to="/privacy" className="hover:text-white">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-white">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link to="/cookies" className="hover:text-white">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>

            {/* Bottom - Centered */}
            <div className="border-t border-neutral-800">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-5 flex justify-center">
                    <p className="text-sm text-gray-400 text-center">
                        © 2026 NewsScope. All rights reserved.
                    </p>
                </div>
            </div>

        </footer>
    );
}