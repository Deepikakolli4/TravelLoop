"use client";

import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", message: "" });

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen py-14">
      <div className="max-w-6xl mx-auto px-6">
         <h1 className="text-2xl md:text-5xl font-extrabold text-center text-gray-800 mb-10">
          Get in Touch with {" "}<span className="text-primary">Travel Loop</span>{" "}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 space-y-8 border">
            <div className="flex items-start gap-4 hover:text-purple-700 transition">
              <MapPin className="w-7 h-7 text-purple-700 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Address</h3>
                <p className="text-gray-600">
                  Visakhapatnam, Andhra Pradesh, India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 hover:text-purple-700 transition">
              <Phone className="w-7 h-7 text-purple-700 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Phone</h3>
                <p className="text-gray-600">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start gap-4 hover:text-purple-700 transition">
              <Mail className="w-7 h-7 text-purple-700 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-800">Email</h3>
                <p className="text-gray-600">travelloop123@gmail.com</p>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed pt-2">
              Have questions about booking flights, trains, or hotels? Our
              support team is available 24/7 to assist you with your travel
              needs.
            </p>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition duration-300 border space-y-6"
          >
            {submitted && (
              <p className="text-green-600 text-center font-medium bg-green-50 p-2 rounded-md">
                Thank you! Your message has been sent.
              </p>
            )}

            <div className="grid grid-cols-1 gap-5">
              <label className="block">
                <span className="font-semibold text-gray-700">Name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-2 focus:ring-purple-200 transition"
                />
              </label>

              <label className="block">
                <span className="font-semibold text-gray-700">Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-2 focus:ring-purple-200 transition"
                />
              </label>

              <label className="block">
                <span className="font-semibold text-gray-700">Message</span>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full px-4 py-2 rounded-md border-gray-300 shadow-sm focus:border-purple-700 focus:ring-2 focus:ring-purple-200 transition"
                />
              </label>
            </div>

            <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white text-lg py-5 rounded-l shadow-md hover:shadow-lg transition">
              Send Message
            </Button>
          </form>
        </div>

        {/* Map */}
        <div className="mt-14 rounded-2xl overflow-hidden shadow-lg border">
          <iframe
            title="Location map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31083.32820667473!2d83.3090285!3d17.6868153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a394f62b4ecb769%3A0x9137a757874fc9b9!2sVisakhapatnam%2C%20Andhra%20Pradesh%2C%20India!5e0!3m2!1sen!2sus!4v="
            className="w-full h-72"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
