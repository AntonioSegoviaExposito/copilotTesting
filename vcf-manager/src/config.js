/**
 * VCF Manager - Configuration
 * Centralized application settings
 */

const Config = {
    // App info
    version: '11.1',
    appName: 'VCF Manager',

    // Phone settings
    phone: {
        defaultCountryCode: '+34',
        minLength: 9
    },

    // UI settings
    ui: {
        maxTelsDisplay: 3,
        defaultFileName: 'contactos'
    },

    // Messages (Spanish)
    messages: {
        emptyList: 'Lista vacia',
        noData: 'No hay datos',
        noName: 'Sin Nombre',
        confirmDelete: (count) => `¿Eliminar ${count} contactos?`,
        confirmClear: '¿Borrar todo?',
        emptyAgenda: 'Agenda vacia.',
        noDuplicates: 'No se encontraron duplicados.',
        autoMergeComplete: '¡Proceso automatico finalizado!',
        autoMergeCancelled: 'Auto-Fusion cancelada.',
        sortAlpha: 'Lista ordenada Alfabeticamente',
        sortCreation: 'Lista ordenada por Creacion'
    }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Config;
}
