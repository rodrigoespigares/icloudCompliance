import React, { useState, useMemo } from 'react';
import { useTable, Column } from 'react-table';
import { Document, DashboardProps } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import FilterMenu from '@/Layouts/FilterMenu';
import CreateDocumentModal from '@/Layouts/CreateDocumentModal';

export default function Dashboard({ documents = [], permissions = [] }: DashboardProps) {

    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<{
        name?: string;
        priority?: number;
        dateApprovedStart?: string;
        dateApprovedEnd?: string;
        dateCreatedStart?: string;
        dateCreatedEnd?: string;
    }>({});
    const [showCreateDocumentModal, setShowCreateDocumentModal] = useState(false);

    const filteredDocuments = useMemo(() => {
        const documentArray = Object.values(documents); // Convierte el objeto a un array
        return documentArray.filter(document => {
            let matchesName = appliedFilters.name
                ? document.name.toLowerCase().includes(appliedFilters.name.toLowerCase())
                : true;
    
            let matchesPriority = appliedFilters.priority !== undefined
                ? document.priority === appliedFilters.priority
                : true;
    
            const hasDateApprovedFilters = appliedFilters.dateApprovedStart || appliedFilters.dateApprovedEnd;
    
            if (hasDateApprovedFilters && !document.date_approved) {
                return false;
            }
    
            let matchesDateApproved = appliedFilters.dateApprovedStart
                ? document.date_approved && new Date(document.date_approved) >= new Date(appliedFilters.dateApprovedStart)
                : true;
    
            let matchesDateApprovedEnd = appliedFilters.dateApprovedEnd
                ? document.date_approved && new Date(document.date_approved) <= new Date(appliedFilters.dateApprovedEnd)
                : true;
    
            let matchesDateCreatedStart = appliedFilters.dateCreatedStart && document.date_submitted
                ? new Date(document.date_submitted) >= new Date(appliedFilters.dateCreatedStart)
                : true;
    
            let matchesDateCreatedEnd = appliedFilters.dateCreatedEnd && document.date_submitted
                ? new Date(document.date_submitted) <= new Date(appliedFilters.dateCreatedEnd)
                : true;
    
            return matchesName && matchesPriority && matchesDateApproved && matchesDateApprovedEnd && matchesDateCreatedStart && matchesDateCreatedEnd;
        });
    }, [documents, appliedFilters]);

    const handleFilterChange = (filters: { name?: string; priority?: number }) => {
        setAppliedFilters(filters);
    };

    const columns: Column<Document>[] = useMemo(
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
                Cell: ({ value }: { value: number }) => {
                    switch (value) {
                        case 1:
                            return 'Baja';
                        case 2:
                            return 'Media';
                        case 3:
                            return 'Alta';
                        default:
                            return 'Desconocida';
                    }
                },
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
                Cell: ({ row }) => (
                    <div className="flex space-x-4">
                        {permissions.includes('can_see') && (
                            <a href={row.original.url} className="text-primary hover:underline text-lg" target="_blank" rel="noopener noreferrer">
                                <Icon icon="bx:show" />
                            </a>
                        )}
                        {permissions.includes('can_edit') && (
                            <a href={`/documents/${row.original.id}/edit`} className="text-blue-500 hover:underline text-lg">
                                <Icon icon="bx:edit" />
                            </a>
                        )}
                        {permissions.includes('can_delete') && (
                            <button
                                onClick={() => handleDelete(row.original.id)}
                                className="text-red-500 hover:underline text-lg"
                            >
                                <Icon icon="bx:trash" />
                            </button>
                        )}
                    </div>
                ),
            },
        ],
        [permissions]
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: filteredDocuments });

    const handleDelete = (id: number) => {
        console.log('Eliminar documento con ID:', id);
    };

    const handleShowFilterMenu = () => {
        setShowFilterMenu(!showFilterMenu);
    };

    return (
        <>
            <FilterMenu isVisible={showFilterMenu} onFilterChange={handleFilterChange} handleShowFilterMenu={handleShowFilterMenu}/>

            <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Inicio</h2>}>
                <Head title="Inicio" />
                
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className='flex justify-end w-full my-2 gap-2'>
                            {permissions.includes('can_create') && <button onClick={() => setShowCreateDocumentModal(true)} className="bg-blue-500 rounded-lg py-2 px-4 text-white hover:bg-blue-600 transition-colors">
                                Crear Documento
                            </button>}
                            <button onClick={() => handleShowFilterMenu()} className="bg-blue-500 rounded-lg py-2 px-4 text-white hover:bg-blue-600 transition-colors">
                                Filtros
                            </button>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-4">Documentos:</h3>

                            <table {...getTableProps()} className="min-w-full table-auto">
                                <thead>
                                    {headerGroups.map(headerGroup => (
                                        <tr {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map(column => (
                                                <th {...column.getHeaderProps()} className="px-4 py-2 border-b border-gray-200 bg-gray-50 text-left text-sm font-semibold text-gray-600">
                                                    {column.render('Header')}
                                                </th>
                                            ))}
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

                            {filteredDocuments.length === 0 && <p className="text-gray-500 mt-4">No hay documentos disponibles.</p>}
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>

            {showCreateDocumentModal && <CreateDocumentModal isVisible={showCreateDocumentModal} onClose={() => setShowCreateDocumentModal(false)} />}
        </>
    );
}
