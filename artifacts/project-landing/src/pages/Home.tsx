import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Cpu, Wifi, Bot, BrainCircuit, Code2, Layers, 
  Terminal, Database, MonitorSmartphone, Eye, 
  CheckCircle2, ArrowRight, Zap, Shield, Clock, Award,
  ChevronDown
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

// --- Form Schema ---
const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  college: z.string().min(2, "College name is required"),
  projectType: z.string().min(1, "Please select a project type"),
  message: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

// --- Data ---
const categories = [
  { icon: <Cpu className="w-8 h-8 text-primary" />, title: "Embedded Systems", desc: "Microcontroller-based hardware solutions and custom PCB designs." },
  { icon: <Wifi className="w-8 h-8 text-primary" />, title: "Internet of Things (IoT)", desc: "Smart connected devices, cloud integration, and sensor networks." },
  { icon: <Bot className="w-8 h-8 text-primary" />, title: "Robotics & Automation", desc: "Autonomous bots, robotic arms, and industrial automation prototypes." },
  { icon: <Zap className="w-8 h-8 text-primary" />, title: "AI in IoT", desc: "Edge AI integration making smart devices truly intelligent." },
  { icon: <Terminal className="w-8 h-8 text-primary" />, title: "ML in Embedded", desc: "TinyML applications running directly on resource-constrained hardware." },
  { icon: <Code2 className="w-8 h-8 text-primary" />, title: "Python Projects", desc: "Advanced scripting, automation, and data analysis systems." },
  { icon: <BrainCircuit className="w-8 h-8 text-primary" />, title: "AI & Machine Learning", desc: "Predictive models, NLP, and intelligent algorithm development." },
  { icon: <Layers className="w-8 h-8 text-primary" />, title: "Django Web Apps", desc: "Robust, scalable, and secure backend web applications." },
  { icon: <MonitorSmartphone className="w-8 h-8 text-primary" />, title: "Full Stack Web Dev", desc: "End-to-end modern web applications (MERN/MEAN stack)." },
  { icon: <Eye className="w-8 h-8 text-primary" />, title: "Deep Learning / CV", desc: "Computer vision, image processing, and neural networks." },
];

const features = [
  { icon: <Award className="w-6 h-6 text-primary" />, title: "5+ Years Experience", desc: "Trusted by students globally." },
  { icon: <CheckCircle2 className="w-6 h-6 text-primary" />, title: "100+ Projects Delivered", desc: "Proven track record of success." },
  { icon: <Clock className="w-6 h-6 text-primary" />, title: "24/7 Support", desc: "We're here whenever you need us." },
  { icon: <Shield className="w-6 h-6 text-primary" />, title: "IEEE/Scopus Quality", desc: "Premium documentation included." },
];

const processSteps = [
  { num: "01", title: "Choose Your Domain", desc: "Select from our wide range of cutting-edge technology domains or pitch your own idea." },
  { num: "02", title: "Customize & Build", desc: "We develop the hardware/software tailored exactly to your university guidelines." },
  { num: "03", title: "Review & Deliver", desc: "Get full source code, hardware, execution videos, and detailed documentation." },
];

export default function Home() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      college: "",
      projectType: "",
      message: "",
    }
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log("Form submitted:", data);
    
    toast({
      title: "Request Submitted Successfully! 🎉",
      description: "Our expert team will contact you within 2 hours.",
      variant: "default",
      className: "bg-green-600 text-white border-none",
    });
    
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* --- Navbar --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Tech<span className="text-primary">Forge</span> Projects
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#domains" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">Domains</a>
            <a href="#offers" className="text-sm font-medium text-primary flex items-center gap-1 animate-pulse">
              <Zap className="w-4 h-4" /> End Offers
            </a>
            <a href="#process" className="text-sm font-medium text-muted-foreground hover:text-white transition-colors">How it Works</a>
          </div>

          <Button asChild className="rounded-full px-6 bg-white text-black hover:bg-gray-200">
            <a href="#contact">Book Now</a>
          </Button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Technology Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8">
              <Zap className="w-4 h-4" /> Final Year Project Bookings Open
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold text-white leading-tight mb-6">
              Your Dream Project, <br />
              <span className="text-gradient-primary">Delivered.</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 font-medium">
              From Idea to Innovation — We Build It. <br className="hidden md:block" />
              Don't just submit a project to pass. <span className="text-white">Submit a statement.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all hover:-translate-y-1">
                <a href="#domains">
                  Browse Domains <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/20 hover:bg-white/5">
                <a href="#contact">Contact Us Now</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Why Choose Us --- */}
      <section className="py-20 bg-secondary/20 border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-glass-card p-6 rounded-2xl flex flex-col items-center text-center group hover:border-primary/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Project Categories --- */}
      <section id="domains" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Master Any Technology 🚀
            </h2>
            <p className="text-xl text-muted-foreground">
              We cover the most demanding and high-scoring domains to ensure your project stands out in evaluations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-glass-card p-8 rounded-3xl hover-glow group cursor-default"
              >
                <div className="mb-6 bg-background rounded-2xl w-16 h-16 flex items-center justify-center border border-white/5 group-hover:border-primary/50 transition-colors">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors">{cat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Urgency / End Offers Section --- */}
      <section id="offers" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-background to-secondary/40" />
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border-2 border-primary/30 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(249,115,22,0.15)] text-center relative overflow-hidden"
          >
            {/* Decorative background blur inside card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="inline-block px-4 py-1.5 bg-red-500/20 text-red-400 font-bold rounded-full text-sm mb-6 border border-red-500/30">
              🔥 FINAL YEAR RUSH OFFER
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
                "Book now, pay later – EMI options",
                "Free project synopsis & IEEE base paper",
                "Express delivery in just 7–21 days"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/5">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-white font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center">
              <p className="text-red-400 font-bold text-lg mb-4 animate-pulse">
                ⚠️ Only 5 slots remaining this month!
              </p>
              <Button asChild size="lg" className="h-16 px-10 text-xl rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/25">
                <a href="#contact">Claim Your Slot Now</a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- How It Works --- */}
      <section id="process" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Simple 3-Step Process 🛠️
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
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

      {/* --- Contact / Lead Form --- */}
      <section id="contact" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          
          {/* Left Text / Image */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              Let's Build Something <br className="hidden lg:block"/>
              <span className="text-primary">Amazing.</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Fill out the form to get a free consultation, project quotation, and base papers. No commitment required.
            </p>
            
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 aspect-video lg:aspect-4/3 max-w-xl mx-auto lg:mx-0 border border-white/10">
              <img 
                src={`${import.meta.env.BASE_URL}images/robotics.png`}
                alt="High tech robotics illustration" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>
          </div>

          {/* Right Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 w-full max-w-xl bg-glass-card p-8 md:p-10 rounded-[2rem] border border-white/10 relative"
          >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Full Name *</label>
                  <Input 
                    {...form.register("name")}
                    placeholder="John Doe" 
                    className="bg-background border-white/10 focus-visible:ring-primary focus-visible:border-primary h-12 rounded-xl"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-400 text-xs mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Phone Number *</label>
                  <Input 
                    {...form.register("phone")}
                    placeholder="+91 9876543210" 
                    className="bg-background border-white/10 focus-visible:ring-primary focus-visible:border-primary h-12 rounded-xl"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-red-400 text-xs mt-1">{form.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Email Address *</label>
                <Input 
                  {...form.register("email")}
                  type="email"
                  placeholder="john@example.com" 
                  className="bg-background border-white/10 focus-visible:ring-primary focus-visible:border-primary h-12 rounded-xl"
                />
                {form.formState.errors.email && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">College / University *</label>
                <Input 
                  {...form.register("college")}
                  placeholder="Enter your college name" 
                  className="bg-background border-white/10 focus-visible:ring-primary focus-visible:border-primary h-12 rounded-xl"
                />
                {form.formState.errors.college && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.college.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Interested Domain *</label>
                <Select onValueChange={(val) => form.setValue("projectType", val)} defaultValue={form.getValues("projectType")}>
                  <SelectTrigger className="bg-background border-white/10 focus-visible:ring-primary h-12 rounded-xl text-white">
                    <SelectValue placeholder="Select a project domain" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/10 text-white">
                    {categories.map((cat, i) => (
                      <SelectItem key={i} value={cat.title} className="focus:bg-primary/20 focus:text-white cursor-pointer">
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.projectType && (
                  <p className="text-red-400 text-xs mt-1">{form.formState.errors.projectType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Message / Requirements (Optional)</label>
                <Textarea 
                  {...form.register("message")}
                  placeholder="Any specific IEEE paper or base idea?" 
                  className="bg-background border-white/10 focus-visible:ring-primary focus-visible:border-primary min-h-[100px] rounded-xl resize-none"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-14 text-lg font-bold rounded-xl bg-gradient-to-r from-orange-500 to-primary hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Submitting Request..." : "Get Free Consultation"}
              </Button>
            </form>
          </motion.div>

        </div>
      </section>

      {/* --- Free Advertising Guide (Informational Utility) --- */}
      <section className="py-20 bg-secondary/10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 mb-4">
              <MonitorSmartphone className="w-6 h-6" />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
              Student / Partner Guide: Where to Advertise for Free 📣
            </h2>
            <p className="text-muted-foreground">
              Want to refer friends and earn, or generate leads for your own sub-agency? Here are the best free platforms to share this website link.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {[
              { 
                title: "Social Media Groups (High Conversion)", 
                content: "Join Facebook groups specifically for 'Engineering Students', 'Final Year Projects India', and local college groups. Post value-driven content (e.g., 'Need help with IoT projects?') and share your link in the comments or DM."
              },
              { 
                title: "Local Business Listings", 
                content: "Create free profiles on Google My Business, Justdial, and IndiaMART. Use keywords like 'Final Year Project Center near me', 'BTech Project developers'. Add your website link to the profile."
              },
              { 
                title: "WhatsApp & Telegram Communities", 
                content: "Share your link on your WhatsApp Status regularly. Join Telegram groups for engineering branches (CS, EC, EE, Mech) and share helpful tips along with the link to your project services."
              },
              { 
                title: "Classifieds & Forums", 
                content: "Post free ads on Olx and Quikr under the 'Education' or 'Services' category. Answer questions on Quora (e.g., 'Where can I buy good final year projects?') and link back naturally."
              },
              { 
                title: "College Notice Boards (Offline to Online)", 
                content: "Generate a QR code linking to this website. Print a bold, simple poster ('Need a Final Year Project? Scan Here') and pin it on college notice boards or outside hostels."
              }
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-white/10 rounded-xl px-6">
                <AccordionTrigger className="text-white hover:text-primary hover:no-underline py-6 font-semibold text-left">
                  {item.title}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {item.content}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-card py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Code2 className="w-6 h-6 text-primary" />
            <span className="font-display font-bold text-xl text-white">TechForge</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TechForge Projects. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
