import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, UploadCloud, TrendingUp, Radio, BarChart2 } from 'lucide-react';

const icons = [
    { id: 1, Icon: CheckSquare, label: 'Review Assignments', color: 'text-emerald-500', ring: 1, delay: 0 },
    { id: 2, Icon: UploadCloud, label: 'Upload Courses', color: 'text-blue-500', ring: 1, delay: 0.1 },
    { id: 3, Icon: TrendingUp, label: 'Track Progress', color: 'text-indigo-500', ring: 2, delay: 0.2 },
    { id: 4, Icon: Radio, label: 'Live Classes', color: 'text-rose-500', ring: 2, delay: 0.3 },
    { id: 5, Icon: BarChart2, label: 'Analytics', color: 'text-amber-500', ring: 2, delay: 0.4 },
];

const HeroOrbit = () => {
    const requestRef = useRef();

    const ring1Radius = 140; // Desktop radii
    const ring2Radius = 200;

    // Base duration for 1 full rotation is ~20 seconds.
    const rotationDuration = 20000;

    const [timestamp, setTimestamp] = useState(0);

    const animate = (time) => {
        setTimestamp(time);
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, []);

    return (
        <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
            {/* Subtle radial gradient background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_60%)] pointer-events-none" />

            <div className="relative w-[400px] h-[400px] flex items-center justify-center sm:scale-100 scale-75">
                {/* Orbit Rings */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute w-full h-full flex items-center justify-center pointer-events-none"
                >
                    {/* We use SVG for clean, static rings with slight gradient tint */}
                    <svg className="absolute w-full h-full" viewBox="-250 -250 500 500">
                        <defs>
                            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="rgba(99,102,241,0.3)" />
                                <stop offset="100%" stopColor="rgba(167,139,250,0.1)" />
                            </linearGradient>
                        </defs>
                        <motion.circle
                            cx="0" cy="0" r={ring1Radius}
                            fill="none" stroke="url(#ringGradient)" strokeWidth="1.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                        />
                        <motion.circle
                            cx="0" cy="0" r={ring2Radius}
                            fill="none" stroke="url(#ringGradient)" strokeWidth="1.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                        />
                    </svg>
                </motion.div>

                {/* Central Core (Nucleus) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative z-10 w-[180px] h-[180px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.2)]"
                >
                    {/* Soft inner radial glow */}
                    <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)]" />
                    <span className="text-white font-extrabold text-3xl tracking-tight relative z-10">EduSync</span>
                </motion.div>

                {/* Orbiting Icons (Electrons) */}
                {icons.map((item, index) => {
                    // Calculate continuous angle based on time. Use an offset per icon to space them out.
                    const angleOffset = (index * (360 / icons.length)) * (Math.PI / 180);
                    // Rotate clockwise continuously without spikes
                    let currentAngle = ((timestamp % rotationDuration) / rotationDuration) * (Math.PI * 2) + angleOffset;

                    // Normalise angle to 0 - 2PI
                    currentAngle = currentAngle % (Math.PI * 2);

                    const radius = item.ring === 1 ? ring1Radius : ring2Radius;

                    // Target angle for top-center expansion (-90 deg / 270 deg / 1.5 PI)
                    const targetAngle = Math.PI * 1.5;
                    // Threshold for when expansion triggers
                    const threshold = 0.3; // radians

                    const distanceToTopCenter = Math.min(
                        Math.abs(currentAngle - targetAngle),
                        Math.abs(currentAngle - targetAngle + Math.PI * 2),
                        Math.abs(currentAngle - targetAngle - Math.PI * 2)
                    );

                    const isActive = distanceToTopCenter < threshold;

                    // Slow down slightly near the top
                    const slowFactor = isActive ? 0.3 : 1;
                    // We fake the slow down by calculating position slightly differently 
                    // However, linear interpolation of time with math is better to avoid jitter.
                    // For a smooth experience, pure linear rotation is often best, but visual expansion overrides.

                    // Because modifying the angle directly based on state causes jitter, we'll keep the angle linear
                    // but use CSS transitions for the visual changes based on the isActive boolean flag.

                    const x = radius * Math.cos(currentAngle);
                    const y = radius * Math.sin(currentAngle);

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isActive ? 1 : 0.6 }}
                            transition={{ delay: item.delay, duration: 0.5 }}
                            className="absolute top-1/2 left-1/2 z-20 pointer-events-none"
                            style={{
                                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                            }}
                        >
                            <div className={`
                            relative flex items-center bg-white dark:bg-slate-900/95 backdrop-blur-md border border-slate-100 dark:border-slate-800/50 
                            transition-all duration-400 ease-out overflow-hidden
                            ${isActive
                                    ? 'w-[200px] h-[72px] px-5 rounded-[24px] shadow-[0_8px_30px_rgba(99,102,241,0.15)] ring-2 ring-indigo-500/10 scale-125'
                                    : 'w-[64px] h-[64px] rounded-full justify-center shadow-[0_4px_15px_rgba(0,0,0,0.03)] scale-90'}
                        `}>
                                <div className={`
                                relative flex items-center justify-center flex-shrink-0 transition-all duration-400
                                ${isActive ? 'mr-3.5 scale-110' : ''}
                            `}>
                                    {/* Subtle pulse glow when active */}
                                    {isActive && (
                                        <div className={`absolute inset-0 rounded-full bg-${item.color.split('-')[1]}-400/20 blur-md animate-pulse`} />
                                    )}
                                    <item.Icon className={`w-6 h-6 ${item.color} relative z-10 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-80'}`} strokeWidth={isActive ? 2 : 1.5} />
                                </div>

                                <div className={`flex flex-col overflow-hidden transition-all duration-400 ${isActive ? 'opacity-100 w-full translate-x-0' : 'opacity-0 w-0 -translate-x-4'}`}>
                                    <span className="text-[14px] font-bold text-slate-800 dark:text-gray-100 leading-tight whitespace-nowrap">{item.label}</span>
                                    <span className="text-[11px] font-medium text-slate-400 mt-0.5 whitespace-nowrap">System Feature</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default HeroOrbit;
