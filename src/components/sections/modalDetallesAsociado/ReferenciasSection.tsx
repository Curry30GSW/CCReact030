import React from 'react';
import { CastigadoDetalle } from '../../../types/castigados-detalles';
import {
    obtenerParentesco,
    obtenerIconoTipoReferencia,
    obtenerColorReferencia
} from '../../utils/referencias';

interface ReferenciasSectionProps {
    detalle: CastigadoDetalle;
}

const ReferenciasSection: React.FC<ReferenciasSectionProps> = ({ detalle }) => {
    // Verificar si tiene referencias tradicionales
    const tieneReferencias = detalle.NOM531 || detalle.NOM532 || detalle.NOM533;

    // Verificar si tiene beneficiarios
    const tieneBeneficiarios = detalle.BEN105 || detalle.BEN205 || detalle.BEN305;

    if (!tieneReferencias && !tieneBeneficiarios) {
        return (
            <div className="seccion-expediente">
                <h4 className="titulo-seccion text-lg font-semibold text-gray-800 dark:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    REFERENCIAS
                </h4>

                <div className="sin-referencias">
                    <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">No se encontraron referencias registradas</p>
                </div>
            </div>
        );
    }

    return (
        <div className="seccion-expediente">
            <h4 className="titulo-seccion text-lg font-semibold text-gray-800 dark:text-white">
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                REFERENCIAS
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {/* Referencia 1 */}
                {detalle.NOM531 && (
                    <div className="referencia-card bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className={`p-2 ${obtenerColorReferencia(detalle.TRF531 || 'P').iconBg} rounded-md mr-3`}>
                                <svg className={`w-5 h-5 ${obtenerColorReferencia(detalle.TRF531 || 'P').iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {obtenerIconoTipoReferencia(detalle.TRF531 || 'P') === 'P' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197v-1a6 6 0 00-9-5.197M9 9a3 3 0 11-6 0 3 3 0 016 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 5.5c-1.5 0-3.5.5-6 3" />
                                    )}
                                </svg>
                            </div>
                            <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                                    Referencia {detalle.TRF531 === 'P' ? 'Personal' : 'Familiar'}
                                </h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {detalle.TRF531 === 'P' ? 'Contacto personal' : 'Contacto familiar'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pl-11">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre completo</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.NOM531} {detalle.APE531}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.DIR531 || 'No disponible'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ciudad</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.CIU531 || 'No disponible'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.TCE531 || 'No disponible'}
                                </p>
                            </div>

                            {detalle.TRF531 && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de referencia</p>
                                    <p className={`${obtenerColorReferencia(detalle.TRF531).text} font-medium`}>
                                        {detalle.TRF531 === 'P' ? 'Personal' : 'Familiar'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Referencia 2 */}
                {detalle.NOM532 && (
                    <div className="referencia-card bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className={`p-2 ${obtenerColorReferencia(detalle.TRF532 || 'P').iconBg} rounded-md mr-3`}>
                                <svg className={`w-5 h-5 ${obtenerColorReferencia(detalle.TRF532 || 'P').iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {obtenerIconoTipoReferencia(detalle.TRF532 || 'P') === 'P' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M9 9a3 3 0 11-6 0 3 3 0 016 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 5.5c-1.5 0-3.5.5-6 3" />
                                    )}
                                </svg>
                            </div>
                            <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                                    Referencia {detalle.TRF532 === 'P' ? 'Personal' : 'Familiar'}
                                </h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {detalle.TRF532 === 'P' ? 'Contacto personal' : 'Contacto familiar'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pl-11">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre completo</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.NOM532} {detalle.APE532}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.DIR532 || 'No disponible'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ciudad</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.CIU532 || 'No disponible'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.TCE532 || detalle.TOF532 || 'No disponible'}
                                </p>
                            </div>

                            {detalle.TRF532 && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de referencia</p>
                                    <p className={`${obtenerColorReferencia(detalle.TRF532).text} font-medium`}>
                                        {detalle.TRF532 === 'P' ? 'Personal' : 'Familiar'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Referencia 3 */}
                {detalle.NOM533 && (
                    <div className="referencia-card bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className={`p-2 ${obtenerColorReferencia(detalle.TRF533 || 'P').iconBg} rounded-md mr-3`}>
                                <svg className={`w-5 h-5 ${obtenerColorReferencia(detalle.TRF533 || 'P').iconText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {obtenerIconoTipoReferencia(detalle.TRF533 || 'P') === 'P' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M9 9a3 3 0 11-6 0 3 3 0 016 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13.5 5.5c-1.5 0-3.5.5-6 3" />
                                    )}
                                </svg>
                            </div>
                            <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                                    Referencia {detalle.TRF533 === 'P' ? 'Personal' : 'Familiar'}
                                </h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {detalle.TRF533 === 'P' ? 'Contacto personal' : 'Contacto familiar'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pl-11">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre completo</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.NOM533} {detalle.APE533}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Dirección</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.DIR533 || 'No disponible'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Ciudad</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.CIU533 || 'No disponible'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.TCE533 || 'No disponible'}
                                </p>
                            </div>

                            {detalle.TRF533 && (
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tipo de referencia</p>
                                    <p className={`${obtenerColorReferencia(detalle.TRF533).text} font-medium`}>
                                        {detalle.TRF533 === 'P' ? 'Personal' : 'Familiar'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Beneficiario 1 */}
                {detalle.BEN105 && (
                    <div className="referencia-card bg-white dark:bg-gray-800 p-6 rounded-lg border border-green-200 dark:border-green-700 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md mr-3">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M9 9a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">Referencia Familiar</h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Contacto familiar</p>
                            </div>
                        </div>

                        <div className="space-y-3 pl-11">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                                <p className="text-gray-700 dark:text-gray-300">{detalle.BEN105}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Documento</p>
                                <p className="text-gray-700 dark:text-gray-300">
                                    {detalle.NIT105 ? Number(detalle.NIT105).toLocaleString('es-CO') : 'No disponible'}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                                <p className="text-gray-700 dark:text-gray-300">{detalle.CEL105 || 'No disponible'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Parentesco</p>
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                    {obtenerParentesco(detalle.PAR105 || '')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Beneficiario 2 */}
                {detalle.BEN205 && (
                    <div className="referencia-card bg-white dark:bg-gray-800 p-6 rounded-lg border border-blue-200 dark:border-blue-700 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md mr-3">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M9 9a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">Beneficiario</h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Contacto beneficiario</p>
                            </div>
                        </div>

                        <div className="space-y-3 pl-11">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                                <p className="text-gray-700 dark:text-gray-300">{detalle.BEN205}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Documento</p>
                                <p className="text-gray-700 dark:text-gray-300">{detalle.NIT205 || 'No disponible'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                                <p className="text-gray-700 dark:text-gray-300">{detalle.CEL205 || 'No disponible'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Parentesco</p>
                                <p className="text-blue-600 dark:text-blue-400 font-medium">
                                    {obtenerParentesco(detalle.PAR205 || '')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Beneficiario 3 */}
                {detalle.BEN305 && (
                    <div className="referencia-card bg-white dark:bg-gray-800 p-6 rounded-lg border border-purple-200 dark:border-purple-700 shadow-sm">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md mr-3">
                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M9 9a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h5 className="font-semibold text-gray-800 dark:text-gray-200">Beneficiario</h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Contacto beneficiario</p>
                            </div>
                        </div>

                        <div className="space-y-3 pl-11">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre</p>
                                <p className="text-gray-700 dark:text-gray-300">{detalle.BEN305}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Documento</p>
                                <p className="text-gray-700 dark:text-gray-300">{detalle.NIT305 || 'No disponible'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Teléfono</p>
                                <p className="text-gray-700 dark:text-gray-300">{detalle.CEL305 || 'No disponible'}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Parentesco</p>
                                <p className="text-purple-600 dark:text-purple-400 font-medium">
                                    {obtenerParentesco(detalle.PAR305 || '')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReferenciasSection;