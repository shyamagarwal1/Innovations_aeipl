import { useState } from "react";
import { motion } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Cpu, Wifi, Bot, BrainCircuit, Code2, Layers,
  Terminal, Database, MonitorSmartphone, Eye,
  CheckCircle2, ArrowRight, Zap, Shield, Clock, Award,
  Phone, Mail, MapPin, Globe, Briefcase, GraduationCap, BookOpen,
  CloudCog, Lock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Countdown } from "@/components/countdown";

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  college: z.string().min(2, "College name is required"),
  projectType: z.string().min(1, "Please select a domain"),
  serviceType: z.enum(["project_only", "project_internship", "internship_only"], {
    errorMap: () => ({ message: "Please select a service type" }),
  }),
  message: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const categories = [
  { icon: <Cpu className="w-8 h-8 text-primary" />, title: "Embedded Systems", desc: "Microcontroller-based hardware solutions, Arduino, STM32, and custom firmware." },
  { icon: <Wifi className="w-8 h-8 text-primary" />, title: "Internet of Things (IoT)", desc: "Smart connected devices, cloud integration, and sensor networks." },
  { icon: <Bot className="w-8 h-8 text-primary" />, title: "Robotics & Automation", desc: "Autonomous bots, robotic arms, and industrial automation prototypes." },
  { icon: <Zap className="w-8 h-8 text-primary" />, title: "AI in IoT", desc: "Edge AI integration — making smart devices truly intelligent." },
  { icon: <Terminal className="w-8 h-8 text-primary" />, title: "ML in Embedded", desc: "TinyML applications running directly on resource-constrained hardware." },
  { icon: <Code2 className="w-8 h-8 text-primary" />, title: "Python", desc: "Advanced scripting, automation, data analysis, and real-world programs." },
  { icon: <BrainCircuit className="w-8 h-8 text-primary" />, title: "AI & Machine Learning", desc: "Predictive models, NLP, deep learning, and computer vision." },
  { icon: <Layers className="w-8 h-8 text-primary" />, title: "Django Web Apps", desc: "Robust, scalable, secure backend web applications with Python." },
  { icon: <MonitorSmartphone className="w-8 h-8 text-primary" />, title: "Full Stack Web Dev", desc: "End-to-end modern web apps — HTML, CSS, JS, Java, and more." },
  { icon: <Eye className="w-8 h-8 text-primary" />, title: "VLSI Design", desc: "Very-Large-Scale Integration — chip design, simulation, and fabrication." },
  { icon: <Database className="w-8 h-8 text-primary" />, title: "Data Science & Analytics", desc: "Data collection, processing, visualization with Python and Power BI." },
  { icon: <Shield className="w-8 h-8 text-primary" />, title: "Cyber Security", desc: "Ethical hacking, penetration testing, and Kali Linux hands-on." },
  { icon: <Lock className="w-8 h-8 text-primary" />, title: "Ethical Hacking", desc: "Offensive security, vulnerability assessment, and bug bounty fundamentals." },
  { icon: <CloudCog className="w-8 h-8 text-primary" />, title: "Cloud Computing", desc: "AWS, Azure, and GCP — deployment, storage, and cloud architecture projects." },
];

const features = [
  { icon: <Award className="w-6 h-6 text-primary" />, title: "Expert Industry Mentors", desc: "Real-time hands-on guidance from experienced engineers." },
  { icon: <CheckCircle2 className="w-6 h-6 text-primary" />, title: "End-to-End Support", desc: "From concept to delivery — we handle everything." },
  { icon: <Clock className="w-6 h-6 text-primary" />, title: "7–21 Day Delivery", desc: "Fast turnaround with no compromise on quality." },
  { icon: <Shield className="w-6 h-6 text-primary" />, title: "IEEE-Quality Docs", desc: "Full source code, reports, and base papers included." },
];

const processSteps = [
  { num: "01", title: "Choose Your Domain", desc: "Select from our wide range of Hardware, Software, or cross-domain technology projects." },
  { num: "02", title: "Customize & Build", desc: "We develop hardware/software tailored to your university guidelines and requirements." },
  { num: "03", title: "Review & Deliver", desc: "Get full source code, hardware, execution videos, and detailed IEEE documentation." },
];

const serviceOptions = [
  {
    value: "project_only",
    label: "Project Only",
    desc: "Complete final year project — hardware/software + documentation + demo video.",
    icon: <BookOpen className="w-6 h-6" />,
    color: "border-blue-500/40 bg-blue-500/5 hover:border-blue-500 hover:bg-blue-500/10",
    activeColor: "border-blue-500 bg-blue-500/20",
    badge: "Most Popular",
  },
  {
    value: "project_internship",
    label: "Project + Internship",
    desc: "Full project delivery plus an internship certificate in your domain of choice.",
    icon: <Briefcase className="w-6 h-6" />,
    color: "border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10",
    activeColor: "border-primary bg-primary/20",
    badge: "Best Value",
  },
  {
    value: "internship_only",
    label: "Internship Only",
    desc: "Domain-specific industrial internship in Embedded, IoT, Robotics, AI/ML, Software, and more.",
    icon: <GraduationCap className="w-6 h-6" />,
    color: "border-green-500/40 bg-green-500/5 hover:border-green-500 hover:bg-green-500/10",
    activeColor: "border-green-500 bg-green-500/20",
    badge: "",
  },
  {
    value: "industrial_course",
    label: "Industrial Course",
    desc: "Enroll in a domain-specific course taught by industry experts — with hands-on labs and a completion certificate.",
    icon: <CloudCog className="w-6 h-6" />,
    color: "border-orange-500/40 bg-orange-500/5 hover:border-orange-500 hover:bg-orange-500/10",
    activeColor: "border-orange-500 bg-orange-500/20",
    badge: "New",
  },
];

export default function Home() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedService, setSelectedService] = useState<string>("");

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      college: "",
      projectType: "",
      serviceType: undefined,
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      toast({
        title: "Enquiry Submitted Successfully! 🎉",
        description: "Our expert team will contact you within 2 hours.",
        className: "bg-green-600 text-white border-none",
      });
      form.reset();
      setSelectedService("");
    } catch {
      toast({
        title: "Submission Failed",
        description: "Please try again or call us directly at +91 72878 71910.",
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}images/logo-main.jpeg`}
              alt="AEIPL Logo"
              className="h-12 w-auto object-contain rounded-lg"
            />
            <div className="leading-tight hidden sm:block">
              <span className="font-display font-extrabold text-base text-white tracking-tight block">
                AE<span className="text-primary">I</span>PL
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
                Agarwal Exploration & Innovation
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#offerings" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Offerings</a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">About</a>
            <a href="#domains" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Domains</a>
            <a href="#offers" className="text-sm font-medium text-primary flex items-center gap-1 animate-pulse">
              <Zap className="w-4 h-4" /> End Offers
            </a>
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Services</a>
          </div>

          <Button asChild className="rounded-full px-6 bg-primary hover:bg-primary/90 text-white">
            <a href="#contact">Book Now</a>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Technology Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8">
              <Zap className="w-4 h-4" /> Now Enrolling — Projects · Internships · Industrial Courses
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-white leading-tight mb-4">
              Where Ideas Soar,<br />
              <span className="text-gradient-primary">Innovations Roar.</span>
            </h1>

            <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-4 font-medium">
              Build. Code. Innovate. Transforming Tomorrow, Today.
            </p>
            <p className="text-base md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
              From hands-on <span className="text-white font-semibold">projects</span> to domain <span className="text-white font-semibold">courses</span> and <span className="text-white font-semibold">internships</span> — everything under one roof.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all hover:-translate-y-1">
                <a href="#offerings">Explore Offerings <ArrowRight className="ml-2 w-5 h-5" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/20 hover:bg-white/5">
                <a href="#contact">Get Free Consultation</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-secondary/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-glass-card p-6 rounded-2xl flex flex-col items-center text-center group hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section id="offerings" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              What We Offer 🎓
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three powerful pathways — pick one or combine them all for maximum growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-10 h-10 text-primary" />,
                title: "Final Year Projects",
                badge: "Most Popular",
                badgeColor: "bg-primary text-white",
                desc: "Hardware & software projects across all major domains — Embedded, IoT, Robotics, AI/ML, Python, Django, Full Stack, and more. Delivered with complete documentation, source code, and demo video.",
                points: ["IEEE-quality documentation", "Full source code included", "7–21 day delivery", "Domain expert mentorship"],
                href: "#contact",
                cta: "Enquire for Project",
                border: "border-primary/30",
              },
              {
                icon: <GraduationCap className="w-10 h-10 text-orange-400" />,
                title: "Industrial Courses",
                badge: "New",
                badgeColor: "bg-orange-500 text-white",
                desc: "Domain-specific training programs taught by industry professionals. Learn Embedded Systems, IoT, Python, AI/ML, Ethical Hacking, Cloud, and more — with hands-on labs and a course completion certificate.",
                points: ["Hands-on lab sessions", "Industry-expert trainers", "Course completion certificate", "Flexible batch timings"],
                href: "#contact",
                cta: "Enroll for a Course",
                border: "border-orange-500/30",
              },
              {
                icon: <Briefcase className="w-10 h-10 text-blue-400" />,
                title: "Internships",
                badge: "",
                badgeColor: "",
                desc: "Industrial internship programs in your chosen domain. Work on real projects, learn industry tools, and earn a valid internship certificate that boosts your resume and placement prospects.",
                points: ["Virtual & in-person options", "Real project exposure", "Internship certificate", "Available all year round"],
                href: "#contact",
                cta: "Apply for Internship",
                border: "border-blue-500/20",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-glass-card rounded-3xl border-2 ${item.border} p-8 flex flex-col hover-glow`}
              >
                {item.badge && (
                  <span className={`absolute -top-3 left-8 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
                <div className="w-16 h-16 rounded-2xl bg-background/60 border border-white/10 flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">{item.desc}</p>
                <ul className="space-y-2 mb-7">
                  {item.points.map((p, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="border-white/20 hover:bg-white/5 w-full">
                  <a href={item.href}>{item.cta} →</a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
                About <span className="text-primary">AEIPL</span> 🔬
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                <strong className="text-white">Agarwal Exploration & Innovation Pvt Ltd</strong> is a cutting-edge
                organization focused on innovation and technological advancement. Our team of talented researchers,
                scientists, and engineers is dedicated to creating groundbreaking solutions for various industries.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We bridge the gap between academic learning and real-world application — preparing the next generation
                of innovators in Robotics, AI, IoT, Embedded Systems, and beyond.
              </p>

              <div className="space-y-4">
                <div className="bg-card border border-primary/20 rounded-2xl p-5">
                  <h4 className="text-primary font-bold mb-2">🎯 Our Mission</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    To support industries and businesses with reliable, innovative, and cost-effective solutions that
                    drive growth and efficiency through cutting-edge R&D, industrial courses, and hands-on project experience.
                  </p>
                </div>
                <div className="bg-card border border-orange-500/20 rounded-2xl p-5">
                  <h4 className="text-orange-400 font-bold mb-2">🚀 Our Vision</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    To be a global leader in delivering innovative industrial solutions and nurturing future talent —
                    empowering industries and individuals to thrive in a technology-driven world.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="bg-card border border-white/10 rounded-3xl p-8 space-y-4">
                <h3 className="text-white font-bold text-xl mb-6">Why Choose Us? ✅</h3>
                {[
                  "Real-time hands-on projects with expert mentors",
                  "Customized R&D solutions for your requirements",
                  "Complete end-to-end project support",
                  "Innovation-focused learning approach",
                  "Strong industry–academia link",
                  "Career-oriented training and internship support",
                  "PCB design, manufacturing & embedded programming",
                  "Services all over India",
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Project Domains */}
      <section id="domains" className="py-24 bg-secondary/10 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Master Any Technology 🚀
            </h2>
            <p className="text-xl text-muted-foreground">
              Projects, Industrial Courses, and Internships available across all domains below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="bg-glass-card p-8 rounded-3xl hover-glow group cursor-default"
              >
                <div className="mb-6 bg-background rounded-2xl w-16 h-16 flex items-center justify-center border border-white/5 group-hover:border-primary/50 transition-colors">
                  {cat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors">{cat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Selection Section */}
      <section id="services" className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-4">
              Choose Your Package 🎓
            </h2>
            <p className="text-xl text-muted-foreground">
              We offer flexible options to match exactly what you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceOptions.map((opt) => (
              <motion.div
                key={opt.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative rounded-3xl border-2 p-8 flex flex-col transition-all duration-200 cursor-pointer ${opt.color}`}
                onClick={() => {
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {opt.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-primary text-white shadow-lg shadow-primary/30">
                    {opt.badge}
                  </span>
                )}
                <div className="w-14 h-14 rounded-2xl bg-background/50 border border-white/10 flex items-center justify-center text-primary mb-5">
                  {opt.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{opt.label}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1">{opt.desc}</p>
                <Button asChild variant="outline" className="border-white/20 hover:bg-white/5 w-full">
                  <a href="#contact">Select & Enquire →</a>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* End Offers */}
      <section id="offers" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-background to-secondary/40" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border-2 border-primary/30 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(249,115,22,0.15)] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

            <div className="inline-block px-4 py-1.5 bg-red-500/20 text-red-400 font-bold rounded-full text-sm mb-6 border border-red-500/30">
              🔥 FINAL YEAR RUSH OFFER — LIMITED TIME
            </div>

            <h2 className="text-4xl md:text-6xl font-display font-black text-white mb-4">
              Grab The Offer Before It's <span className="text-primary">Gone!</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 font-medium">
              Limited Slots. Unlimited Potential.
            </p>

            <div className="flex justify-center mb-10">
              <Countdown />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left mb-10">
              {[
                "Up to 40% Off on selected projects",
                "Book now, pay later — EMI options available",
                "Free project synopsis & IEEE base paper",
                "Express delivery in just 7–21 days",
                "Free internship certificate with Project + Internship pack",
                "Free project documentation & demo video",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-white font-medium text-sm">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-red-400 font-bold text-lg mb-6 animate-pulse">
              ⚠️ Only 5 slots remaining this month!
            </p>
            <Button asChild size="lg" className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/25">
              <a href="#contact">Claim Your Slot Now</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="process" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Simple 3-Step Process 🛠️
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {processSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-card border-4 border-background flex items-center justify-center text-3xl font-display font-black text-primary shadow-[0_0_20px_rgba(249,115,22,0.2)] mb-6">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-muted-foreground max-w-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Enquiry Form */}
      <section id="contact" className="py-24 relative bg-secondary/10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">

          {/* Left Info */}
          <div className="flex-1 lg:sticky lg:top-28">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Let's Build Something <span className="text-primary">Amazing.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Fill out the form to get a free consultation and project quotation. No commitment required.
            </p>

            <div className="space-y-4 mb-8">
              <a href="tel:+919494040947" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Call Us</p>
                  <p className="text-white font-semibold">+91 94940 40947 / +91 70326 70278</p>
                </div>
              </a>
              <a href="mailto:ad.officials07@gmail.com" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Email Us</p>
                  <p className="text-white font-semibold">ad.officials07@gmail.com</p>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Location</p>
                  <p className="text-white font-semibold text-sm">Visakhapatnam, Andhra Pradesh, India — 530016</p>
                </div>
              </div>
              <a href="https://adoofficial.blogspot.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Blog / More</p>
                  <p className="text-white font-semibold">adoofficial.blogspot.com</p>
                </div>
              </a>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
              <img
                src={`${import.meta.env.BASE_URL}images/robotics.png`}
                alt="AEIPL robotics"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          </div>

          {/* Right Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 w-full max-w-xl bg-glass-card p-8 md:p-10 rounded-[2rem] border border-white/10"
          >
            <h3 className="text-2xl font-bold text-white mb-2">Get Free Consultation</h3>
            <p className="text-muted-foreground text-sm mb-8">Fill in your details and we'll get back within 2 hours.</p>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              {/* Service Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">I Need *</label>
                <Controller
                  name="serviceType"
                  control={form.control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-2">
                      {serviceOptions.map(opt => (
                        <button
                          type="button"
                          key={opt.value}
                          onClick={() => {
                            field.onChange(opt.value);
                            setSelectedService(opt.value);
                          }}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                            field.value === opt.value
                              ? opt.activeColor + " text-white"
                              : "border-white/10 bg-background/50 hover:border-white/20 text-muted-foreground"
                          }`}
                        >
                          <span className={field.value === opt.value ? "text-primary" : "text-muted-foreground"}>
                            {opt.icon}
                          </span>
                          <div>
                            <p className={`font-semibold text-sm ${field.value === opt.value ? "text-white" : ""}`}>{opt.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{opt.desc.slice(0, 55)}...</p>
                          </div>
                          <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            field.value === opt.value ? "border-primary bg-primary" : "border-white/20"
                          }`}>
                            {field.value === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                />
                {form.formState.errors.serviceType && (
                  <p className="text-red-400 text-xs">{form.formState.errors.serviceType.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Full Name *</label>
                  <Input {...form.register("name")} placeholder="Your Name" className="bg-background border-white/10 focus-visible:ring-primary h-12 rounded-xl" />
                  {form.formState.errors.name && <p className="text-red-400 text-xs">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Phone Number *</label>
                  <Input {...form.register("phone")} placeholder="+91 9876543210" className="bg-background border-white/10 focus-visible:ring-primary h-12 rounded-xl" />
                  {form.formState.errors.phone && <p className="text-red-400 text-xs">{form.formState.errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Email Address *</label>
                <Input {...form.register("email")} type="email" placeholder="you@example.com" className="bg-background border-white/10 focus-visible:ring-primary h-12 rounded-xl" />
                {form.formState.errors.email && <p className="text-red-400 text-xs">{form.formState.errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">College / University *</label>
                <Input {...form.register("college")} placeholder="Your college name" className="bg-background border-white/10 focus-visible:ring-primary h-12 rounded-xl" />
                {form.formState.errors.college && <p className="text-red-400 text-xs">{form.formState.errors.college.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Interested Domain *</label>
                <Controller
                  name="projectType"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-background border-white/10 h-12 rounded-xl text-white">
                        <SelectValue placeholder="Select a domain" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-white/10 text-white">
                        {categories.map((cat, i) => (
                          <SelectItem key={i} value={cat.title} className="focus:bg-primary/20 cursor-pointer">
                            {cat.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.projectType && <p className="text-red-400 text-xs">{form.formState.errors.projectType.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Message / Requirements (Optional)</label>
                <Textarea {...form.register("message")} placeholder="Any specific idea, IEEE paper, or requirements?" className="bg-background border-white/10 focus-visible:ring-primary min-h-[90px] rounded-xl resize-none" />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-orange-500 to-primary hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Submitting..." : "Get Free Consultation →"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Free Advertising Guide */}
      <section className="py-20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
              Refer & Earn: Where to Advertise for Free 📣
            </h2>
            <p className="text-muted-foreground">
              Share this page and help fellow students — and earn rewards for every referral.
            </p>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { title: "Social Media Groups (High Conversion)", content: "Join Facebook groups for 'Engineering Students', 'Final Year Projects India', and local college groups. Post value content and share your link. Instagram Reels and WhatsApp Status work extremely well." },
              { title: "Google My Business & Justdial", content: "Create free profiles on Google My Business, Justdial, and IndiaMART. Use keywords like 'Final Year Project Center Visakhapatnam'. Add this website link to the profile." },
              { title: "WhatsApp & Telegram Communities", content: "Share your link on WhatsApp Status daily. Join Telegram groups for engineering branches (CS, EC, EE, Mech) and share helpful tips along with the project link." },
              { title: "Quora, Reddit & Forums", content: "Answer questions on Quora like 'Where to get final year projects in Vizag?' Link back naturally. Post in Reddit r/india, r/engineering, and r/artificial communities." },
              { title: "College Notice Boards (Offline to Online)", content: "Generate a QR code for this website. Print bold posters ('Need a Final Year Project? Scan Here!') and pin them on college notice boards, hostels, and canteens." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-white/10 rounded-xl px-6">
                <AccordionTrigger className="text-white hover:text-primary hover:no-underline py-5 font-semibold text-left">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed text-sm">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card pt-12 pb-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-4 mb-3">
                <img
                  src={`${import.meta.env.BASE_URL}images/logo-round.jpeg`}
                  alt="AEIPL Round Logo"
                  className="h-14 w-14 object-contain rounded-full border border-white/10"
                />
                <div>
                  <span className="font-display font-extrabold text-base text-white block">
                    Agarwal Exploration & Innovation Pvt Ltd
                  </span>
                  <p className="text-xs text-muted-foreground italic">"Where Ideas soar Innovations roar"</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Visakhapatnam, Andhra Pradesh, India — 530016<br />
                +91 94940 40947 &nbsp;|&nbsp; +91 70326 70278<br />
                ad.officials07@gmail.com
              </p>
            </div>

            {/* Connect with us */}
            <div>
              <p className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Connect With Us</p>
              <div className="flex flex-col gap-3">
                <a
                  href="https://whatsapp.com/channel/0029Vayra0a9cDDTOlYwul0t"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-green-400 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  WhatsApp Channel
                </a>
                <a
                  href="https://www.linkedin.com/company/agarwal-exploration-innovation-pvt-ltd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-blue-400 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  LinkedIn Page
                </a>
                <a
                  href="https://linktr.ee/Agarwal_Exploration_Innovation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  All Our Links (Linktree)
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Agarwal Exploration & Innovation Pvt Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
