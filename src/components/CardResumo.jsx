import React from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

const CardResumo = ({ title, value, icon: Icon, color, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-xl transition-shadow"
            style={{ borderLeftColor: color }}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(value)}</p>
                </div>
                <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                >
                    <Icon className="w-7 h-7" style={{ color }} />
                </div>
            </div>
        </motion.div>
    );
};

export default CardResumo;