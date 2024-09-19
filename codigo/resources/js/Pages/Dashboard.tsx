import React from 'react';
import { useTable, Column } from 'react-table';
import { Document } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface DashboardProps {
    documents?: Document[];
}

export default function Dashboard({ documents = [] }: DashboardProps) {
    const data = React.useMemo(() => documents, [documents]);

    const columns: Column<Document>[] = React.useMemo(
        () => [
            {
                Header: 'Nombre',
                accessor: 'name', 
            },
            {
                Header: 'Descripción',
                accessor: 'description', 
            },
            {
                Header: 'Prioridad',
                accessor: 'priority', 
            },
            {
                Header: 'Fecha de Envío',
                accessor: 'date_submitted',
                Cell: ({ value }: { value: string }) => new Date(value).toLocaleDateString(),
            },
            {
                Header: 'Fecha de Aprobación',
                accessor: 'date_approved', 
                Cell: ({ value }: { value?: string }) =>
                    value ? new Date(value).toLocaleDateString() : 'No aprobada',
            },
            {
                Header: 'Acciones',
                accessor: 'url', 
                Cell: ({ value }: { value: string }) => (
                    <a href={value} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                        Ver Documento
                    </a>
                ),
            },
        ],
        []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Home</h2>}
        >
            <Head title="Dashboard" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="font-semibold text-lg mb-4">Documentos:</h3>

                        <table {...getTableProps()} className="min-w-full table-auto">
                            <thead>
                                {headerGroups.map(headerGroup => (
                                    <tr {...headerGroup.getHeaderGroupProps()}>
                                        {headerGroup.headers.map(column => {
                                            const { key, ...restHeaderProps } = column.getHeaderProps();
                                            return (
                                                <th key={key} {...restHeaderProps} className="px-4 py-2 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">
                                                    {column.render('Header')}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </thead>
                            <tbody {...getTableBodyProps()}>
                                {rows.map(row => {
                                    prepareRow(row);
                                    return (
                                        <tr {...row.getRowProps()}>
                                            {row.cells.map(cell => (
                                                <td {...cell.getCellProps()} className="px-4 py-2 border-b border-gray-200 text-sm text-gray-700">
                                                    {cell.render('Cell')}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {documents.length === 0 && <p className="text-gray-500 mt-4">No hay documentos disponibles.</p>}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}