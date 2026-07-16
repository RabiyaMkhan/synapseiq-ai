import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  FiUpload,
  FiCpu,
  FiBarChart2,
  FiMessageSquare,
  FiZap,
  FiFileText,
} from 'react-icons/fi';
import { SiGithub, SiLinkedin, SiTwitter } from 'react-icons/si';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
};

const features = [
  {
    icon: FiUpload,
    title: 'Smart Data Upload',
    desc: 'Upload CSV, Excel, and PDF files with intelligent auto-detection and validation.',
  },
  {
    icon: FiCpu,
    title: 'AI-Powered Analysis',
    desc: 'Deep machine learning insights that uncover hidden patterns in your data.',
  },
  {
    icon: FiBarChart2,
    title: 'Interactive Dashboard',
    desc: 'Real-time charts, KPIs, and visualizations that bring your data to life.',
  },
  {
    icon: FiMessageSquare,
    title: 'AI Chat Assistant',
    desc: 'Ask natural language questions about your data and get instant answers.',
  },
  {
    icon: FiZap,
    title: 'Smart Recommendations',
    desc: 'AI-driven suggestions to optimize your business decisions and strategy.',
  },
  {
    icon: FiFileText,
    title: 'Report Generation',
    desc: 'Export professional, shareable reports with a single click.',
  },
];

const steps = [
  { num: '01', title: 'Upload', desc: 'Drag and drop your dataset or browse to select files.' },
  { num: '02', title: 'Analyze', desc: 'Our AI engine processes and understands your data instantly.' },
  { num: '03', title: 'Visualize', desc: 'Explore interactive charts and dynamic dashboards.' },
  { num: '04', title: 'Report', desc: 'Generate and export comprehensive analytical reports.' },
];

const stats = [
  { value: '10K+', label: 'Analyses' },
  { value: '500+', label: 'Users' },
  { value: '99.9%', label: 'Accuracy' },
  { value: '50+', label: 'Insights' },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Data Analyst at TechCorp',
    quote:
      'SynapseIQ AI transformed how we handle data analysis. What used to take hours now takes minutes with incredible accuracy.',
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CEO of DataFlow Inc.',
    quote:
      'The AI chat assistant is a game changer. I can ask complex questions about our metrics and get clear, actionable insights instantly.',
  },
  {
    name: 'Emily Watson',
    role: 'Research Lead at BioGen',
    quote:
      'The report generation feature alone saved us dozens of hours per month. The visualizations are stunning and presentation-ready.',
  },
];

const floatingShapes = [
  { size: 80, x: '10%', y: '20%', delay: 0, duration: 6 },
  { size: 60, x: '80%', y: '30%', delay: 1, duration: 7 },
  { size: 100, x: '70%', y: '70%', delay: 2, duration: 8 },
  { size: 50, x: '20%', y: '80%', delay: 0.5, duration: 5 },
  { size: 70, x: '50%', y: '10%', delay: 1.5, duration: 6.5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-950 text-white overflow-hidden">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="absolute inset-0 overflow-hidden">
          {floatingShapes.map((shape, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-2xl"
              style={{ width: shape.size, height: shape.size, left: shape.x, top: shape.y }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: shape.duration,
                delay: shape.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-6">
              AI-Powered Data Intelligence Platform
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            Unlock the Power of{' '}
            <span className="gradient-text">Your Data</span> with AI
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Upload, analyze, and visualize your datasets with intelligent AI-powered insights.
            Transform raw data into actionable intelligence.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-primary-500/25"
            >
              Get Started Free
            </Link>
            <button className="px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all duration-200">
              Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Everything you need to transform raw data into meaningful insights.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary-500/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-shadow duration-300">
                  <f.icon className="text-white" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="about" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              From raw data to actionable insights in four simple steps.
            </p>
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-500/50 via-accent-500/50 to-primary-500/50" />
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="relative text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-3xl font-bold shadow-lg shadow-primary-500/25 relative z-10">
                  {step.num}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="text-4xl sm:text-5xl font-bold gradient-text mb-2">{s.value}</div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              What Users <span className="gradient-text">Say</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Trusted by data professionals around the world.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-yellow-400 text-lg">&#9733;</span>
                  ))}
                </div>
                <p className="text-gray-300 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-gray-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-white/10 backdrop-blur-sm"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Ready to Transform <span className="gradient-text">Your Data</span>?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of data professionals who trust SynapseIQ AI for their analytics needs.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold text-lg hover:opacity-90 transition-opacity duration-200 shadow-lg shadow-primary-500/25"
          >
            Get Started Free
          </Link>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold gradient-text">SynapseIQ AI</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Transform raw data into actionable intelligence with the power of artificial
                intelligence.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <SiGithub size={18} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <SiLinkedin size={18} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  <SiTwitter size={18} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Changelog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#about" className="text-sm text-gray-400 hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              Built with AI-powered intelligence
            </p>
            <p className="text-gray-500 text-sm">
              &copy; 2024 SynapseIQ AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
