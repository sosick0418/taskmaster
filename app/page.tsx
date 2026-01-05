"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  CheckCircle2,
  Kanban,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  Github,
  Twitter,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  {
    icon: Kanban,
    title: "Kanban Board",
    description: "Drag & drop으로 직관적인 태스크 관리. 상태별로 한눈에 파악하세요.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: CheckCircle2,
    title: "Smart Lists",
    description: "필터, 검색, 정렬 기능으로 원하는 태스크를 빠르게 찾으세요.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Sparkles,
    title: "Delightful UX",
    description: "완료 시 confetti 축하! 부드러운 애니메이션으로 즐거운 경험을.",
    gradient: "from-fuchsia-500 to-pink-600",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimistic UI로 즉각적인 반응. 기다림 없는 빠른 작업 흐름.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    description: "GitHub, Google OAuth로 안전하고 간편한 로그인.",
    gradient: "from-emerald-500 to-green-600",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/30 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/2 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-600/30 blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 40, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 left-1/2 h-[350px] w-[350px] rounded-full bg-fuchsia-600/20 blur-[120px]"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Noise texture */}
        <div className="absolute inset-0 noise" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08] bg-black/50 backdrop-blur-xl"
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Taskmaster</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Button
              asChild
              className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero section */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 text-sm backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-white/70">포트폴리오용 힙한 Todo App</span>
          </motion.div>

          {/* Heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            <span className="block">Master Your Tasks</span>
            <span className="gradient-text block">With Style</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/50 sm:text-xl">
            직관적인 칸반 보드, 강력한 필터링, 화려한 애니메이션.
            <br />
            당신의 생산성을 한 단계 업그레이드하세요.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 bg-gradient-to-r from-violet-500 to-cyan-500 px-8 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
            >
              <Link href="/login">
                시작하기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-white/[0.15] bg-white/[0.02] px-8 backdrop-blur-sm hover:bg-white/[0.05]"
            >
              <a
                href="https://github.com/sosick0418/taskmaster"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-4 w-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex flex-col items-center gap-2 text-white/30"
          >
            <span className="text-xs">Scroll to explore</span>
            <div className="h-8 w-5 rounded-full border border-white/20">
              <motion.div
                animate={{ y: [4, 12, 4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mx-auto mt-1 h-1.5 w-1.5 rounded-full bg-white/40"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features section */}
      <section className="relative py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Everything you need to{" "}
              <span className="gradient-text">stay organized</span>
            </h2>
            <p className="mx-auto max-w-2xl text-white/50">
              심플하지만 강력한 기능들로 효율적인 태스크 관리를 경험하세요.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.04]"
              >
                {/* Gradient accent */}
                <div
                  className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${feature.gradient} opacity-50`}
                />

                {/* Icon */}
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-white/50">{feature.description}</p>

                {/* Hover glow */}
                <div
                  className={`absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA section */}
      <section className="relative py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-8 backdrop-blur-sm sm:p-12 md:p-16"
          >
            {/* Background decoration */}
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-500/20 blur-[100px]" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-[100px]" />

            <div className="relative text-center">
              <h2 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
                Ready to boost your{" "}
                <span className="gradient-text">productivity</span>?
              </h2>
              <p className="mx-auto mb-8 max-w-xl text-white/50">
                지금 바로 Taskmaster로 태스크 관리를 시작하세요.
                GitHub 또는 Google 계정으로 간편하게 시작할 수 있습니다.
              </p>
              <Button
                asChild
                size="lg"
                className="h-14 bg-gradient-to-r from-violet-500 to-cyan-500 px-10 text-lg text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50"
              >
                <Link href="/login">
                  무료로 시작하기
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-cyan-500">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">Taskmaster</span>
          </div>

          <p className="text-sm text-white/40">
            Built with Next.js, Tailwind CSS, and Framer Motion
          </p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/sosick0418/taskmaster"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 transition-colors hover:text-white"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 transition-colors hover:text-white"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
