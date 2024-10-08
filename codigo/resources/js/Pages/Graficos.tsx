import React from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { DashboardProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

ChartJS.register(Tooltip, Legend, ArcElement, CategoryScale, LinearScale, PointElement, LineElement);

export default function Graficos({ documents = [], permissions = [] }: DashboardProps) {
    const relevanceCounts = documents.reduce((acc: { [key: string]: number }, doc) => {
        const relevance = doc.priority === 1 ? 'Baja' : doc.priority === 2 ? 'Media' : 'Alta';
        acc[relevance] = (acc[relevance] || 0) + 1;
        return acc;
    }, {});

    const doughnutData = {
        labels: Object.keys(relevanceCounts),
        datasets: [
            {
                data: Object.values(relevanceCounts),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            },
        ],
    };

    const lineDataCounts = Array(12).fill(0);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    documents.forEach(doc => {
        if (doc.date_approved) {
            const approvedDate = new Date(doc.date_approved);
            const month = approvedDate.getMonth();
            const year = approvedDate.getFullYear();
            
            if (year === currentYear - 1 && month > currentMonth) {
                lineDataCounts[month] += 1;
            } else if (year === currentYear && month <= currentMonth) {
                lineDataCounts[month] += 1;
            }
        }
    });


    var labels = [];
    for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentYear, currentMonth - i);
        labels.push(monthDate.getMonth() );
    }
    const orderLineDataCounts : number[] = [];

    labels.map(label => {
        orderLineDataCounts.push(lineDataCounts[label]);
    });

    labels = [];
    for (let i = 0; i < 12; i++) {
        const monthDate = new Date(currentYear, currentMonth - i);
        labels.push(monthDate.getMonth() + 1 + " / " + monthDate.getFullYear());
    }

    const lineData = {
        labels: labels.reverse(),
        datasets: [
            {
                label: 'Documentos Aprobados',
                data: orderLineDataCounts.reverse(),
                borderColor: '#42A5F5',
                backgroundColor: 'rgba(66, 165, 245, 0.2)',
                fill: true,
            },
        ],
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Gráficos</h2>}>
            <Head title="Gráficos" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4">Cantidad de Documentos por Relevancia</h3>
                        <div className="flex justify-between">
                            <div className="w-1/3">
                                <Doughnut data={doughnutData} />
                            </div>
                            <div className="w-1/2">
                                <h3 className="font-semibold text-lg mb-4">Cantidad de Documentos Aprobados por Mes</h3>
                                <Line data={lineData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
