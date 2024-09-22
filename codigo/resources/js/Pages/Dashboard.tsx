import React, { useState, useMemo, useEffect } from 'react';
import { useTable, Column } from 'react-table';
import { Document, DashboardProps, User } from '@/types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import FilterMenu from '@/Layouts/FilterMenu';
import CreateDocumentModal from '@/Layouts/CreateDocumentModal';
import Loading from './Loading';

export default function Dashboard({ documents = [], permissions = [] }: DashboardProps) {
    const params = new URLSearchParams(location.search);
    const paramValue = params.get('login');

    if (paramValue) {
        window.location.href = '/';
        return <Loading></Loading>;
    }

    const csrfToken = document
    .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
    ?.getAttribute('content');

    const headers: HeadersInit = csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {};
    useEffect(() => {
        getDocuments();
    }, []); 

    
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showModalDetail, setShowModalDetail] = useState(false);
    const [userList, setUserList] = useState<User[]>([]);
    const [appliedFilters, setAppliedFilters] = useState<{
        name?: string;
        priority?: number;
        dateApprovedStart?: string;
        dateApprovedEnd?: string;
        dateCreatedStart?: string;
        dateCreatedEnd?: string;
    }>({});
    const [showCreateDocumentModal, setShowCreateDocumentModal] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [documentList, setDocumentList] = useState<Document[]>(documents);

    const filteredDocuments = useMemo(() => {
        const documentArray = Object.values(documentList);
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
    }, [documentList, appliedFilters]);

    const handleFilterChange = (filters: { name?: string; priority?: number }) => {
        setAppliedFilters(filters);
    };

    const getDocuments = () => {
        fetch("/documents/relevance", {
            method: "GET",
            headers
        })
            .then((response) => response.json())
            .then((data) => {
                const documentsArray = Object.values(data) as Document[];
    
                const sortedDocuments = documentsArray.sort((a, b) => {
                    return b.priority - a.priority;
                });
    
                setDocumentList(sortedDocuments); 
            })
            .catch((error) => {
                console.error("Error al obtener los documentos:", error);
            });
    };

    const columns: Column<Document>[] = useMemo(
        () => [
            {
                Header: 'Nombre del Documento',
                accessor: 'name',
            },
            {
                Header: 'Prioridad',
                accessor: 'priority',
                Cell: ({ value }: { value: number }) => {
                    switch (value) {
                        case 1:
                            return (<span className='text-green-600'>Baja </span>);
                        case 2:
                            return (<span className='text-yellow-600'>Media </span>);
                        case 3:
                            return (<span className='text-red-600'>Alta </span>);
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
                            <button onClick={() => { handleDetail(row.original) }} className="text-primary hover:underline text-lg" rel="noopener noreferrer">
                                <Icon icon="bx:show" />
                            </button>
                        )}
                        {permissions.includes('can_edit') && (
                            <button
                                onClick={() => handleEdit(row.original)}
                                className="text-blue-500 hover:underline text-lg"
                            >
                                <Icon icon="bx:edit" />
                            </button>
                        )}
                        {permissions.includes('can_delete') && (
                            <button
                                onClick={() => handleDelete(row.original)}
                                className="text-red-500 hover:underline text-lg"
                            >
                                <Icon icon="bx:trash" />
                            </button>
                        )}
                        {permissions.includes('can_approve') && row.original.date_approved === null && (
                            <button
                                onClick={() => handleApprove(row.original)}
                                className="text-green-500 hover:underline text-lg"
                            >
                                <Icon icon="majesticons:check" />
                            </button>
                        )}
                    </div>
                ),
            },
        ],
        [permissions]
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: filteredDocuments });

    const handleDelete = (document: Document) => {
        setSelectedDocument(document);
        setShowDeleteModal(true);
    };

    const handleApprove = (document: Document) => {
        setSelectedDocument(document);
        setShowApproveModal(true);
    };

    const handleShowFilterMenu = () => {
        setShowFilterMenu(!showFilterMenu);
    };

    const handleEdit = (document: Document) => {
        if (!document.detail) {
            console.error("Detail URL no está definido");
            return;
        }
    
        fetch(document.detail)
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        console.log(errorData);
                    });
                } else {
                    response.json().then((data) => {
                        setSelectedDocument(data);
                        setShowCreateDocumentModal(true);
                    });
                }
            });
    };

    const handleCreate = () => {
        setSelectedDocument(null); 
        setShowCreateDocumentModal(true); 
    };
    
    const handleDetail = (document: Document) => {
        if (!document.detail) {
            console.error("Detail URL no está definido");
            return;
        }
        
        fetch(document.detail)
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        console.log(errorData);
                    });
                } else {
                    response.json().then((data) => {
                        setSelectedDocument(data);
                        setShowModalDetail(true);
                    });
                }
            });
    };

    const approveDocument = (id: number) => {
        fetch(`/documents/${id}`, {
            method: "PATCH",
            headers
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        console.log(errorData);
                    });
                } else {
                    response.json().then((data) => {
                        getDocuments();
                    });
                }
            })
            .catch((error) => {
                console.error("Error al aprobar el documento:", error);
            });
    };

    const removeDocument = (id: number) => {
        fetch(`/documents/${id}`, {
            method: "DELETE",
            headers
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((errorData) => {
                        console.log(errorData);
                    });
                } else {
                    response.json().then((data) => {
                        getDocuments();
                    });
                }
            })
            .catch((error) => {
                console.error("Error al eliminar el documento:", error);
            });
    };

    return (
        <>
            <FilterMenu isVisible={showFilterMenu} onFilterChange={handleFilterChange} handleShowFilterMenu={handleShowFilterMenu} />

            <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Inicio</h2>}>
                <Head title="Inicio" />
                
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className='flex justify-end w-full my-2 gap-2'>
                            {permissions.includes('can_create') && (
                                <button onClick={handleCreate} className="bg-blue-500 rounded-lg py-2 px-4 text-white hover:bg-blue-600 transition-colors">
                                    Crear Documento
                                </button>
                            )}
                            <button onClick={handleShowFilterMenu} className="bg-blue-500 rounded-lg py-2 px-4 text-white hover:bg-blue-600 transition-colors">
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

            {showCreateDocumentModal && (
                <CreateDocumentModal
                    isVisible={showCreateDocumentModal}
                    onClose={() => setShowCreateDocumentModal(false)}
                    documents={selectedDocument}
                    onSave={() => {
                        getDocuments();
                        setShowCreateDocumentModal(false);
                    }}
                />
            )}

            {showDeleteModal && selectedDocument && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50' onClick={() => setShowDeleteModal(false)}>
                    <div className='w-[30vw] bg-white py-2 px-4 transition-opacity duration-300 ease-in-out rounded-lg'>
                        <h2 className='mb-4'>¿Estás seguro de que quieres eliminar este documento?</h2>
                        <div className='flex justify-evenly items-center'>
                            <button className='w-24 text-white rounded-md bg-red-500' onClick={() => setShowDeleteModal(false)}>No</button>
                            <button className='w-24 text-white rounded-md bg-green-600' onClick={() => removeDocument(selectedDocument.id)}>Sí</button>
                        </div>
                    </div>
                </div>
            )}

            {showApproveModal && selectedDocument && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50' onClick={() => setShowApproveModal(false)}>
                    <div className='w-[30vw] bg-white py-2 px-4 transition-opacity duration-300 ease-in-out rounded-lg'>
                        <h2 className='mb-4'>¿Estás seguro de que quieres aprobar este documento?</h2>
                        <div className='flex justify-evenly items-center'>
                            <button className='w-24 text-white rounded-md bg-red-500' onClick={() => setShowApproveModal(false)}>No</button>
                            <button className='w-24 text-white rounded-md bg-green-600' onClick={() => approveDocument(selectedDocument.id)}>Sí</button>
                        </div>
                    </div>
                </div>
            )}

            {showModalDetail && selectedDocument && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50' onClick={() => setShowModalDetail(false)}>
                    <div className='w-[30vw] bg-white py-2 px-4 transition-opacity duration-300 ease-in-out rounded-lg'>
                        <div className='flex justify-between items-start'>
                            <h2 className='mb-4 text-3xl'>Detalle del Documento</h2>
                            <div className='flex justify-evenly items-center'>
                                <button className='text-white rounded-md bg-red-500 text-xl' onClick={() => setShowModalDetail(false)}><Icon icon="bx-x" /></button>
                            </div>
                        </div>
                        <div className='flex flex-col justify-evenly items-center gap-2'>
                            <div className='w-full'>
                                <b>Nombre:</b> {selectedDocument.name}
                            </div>
                            <div className='w-full'>
                                <b>Descripción:</b> {selectedDocument.description}
                            </div>
                            <div className='w-full'>
                                <b>Prioridad:</b> {selectedDocument.priority === 1 ? 'Baja' : selectedDocument.priority === 2 ? 'Media' : 'Alta'}
                            </div>
                            <div className='w-full'>
                                <b>Fecha de Envío:</b> {new Date(selectedDocument.date_submitted).toLocaleDateString()} 
                            </div>
                            <div className='w-full'>
                                <b>Fecha de Aprobación:</b> {selectedDocument.date_approved ? new Date(selectedDocument.date_approved).toLocaleDateString() : 'No Aprobada'}
                            </div> 
                            <div className='w-full'>
                                <b>Usuario asignado: </b>{ selectedDocument.username }
                            </div>
                            <div className='w-full flex flex-col'>
                                <b>Acciones:</b>
                                <div className='flex justify-evenly items-center'>
                                    <a href={route('view-pdf', selectedDocument.id)} className="w-32 text-center bg-primary rounded-md text-white text-decoration-none" target="_blank" rel="noopener noreferrer">Ver documento</a>
                                    {   permissions.includes('can_delete') && (
                                        <button className='w-32 text-white rounded-md bg-red-500' onClick={() => handleDelete(selectedDocument)}>Eliminar</button>
                                    )}
                                    {selectedDocument.date_approved == null && permissions.includes('can_approve') && (
                                        <button className='w-32 text-white rounded-md bg-green-600' onClick={() => handleApprove(selectedDocument)}>Aprobar</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}