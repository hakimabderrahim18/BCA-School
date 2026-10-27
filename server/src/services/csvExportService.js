/**
 * Service pour la conversion de tableaux d'objets JSON en format CSV
 * Ajoute un BOM UTF-8 (\uFEFF) pour garantir le bon affichage des accents sous Excel Windows
 */
export const exportToCSV = (data, fields, res, filename = 'export.csv') => {
  if (!data || !data.length) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send('\uFEFF');
  }

  // Ligne d'en-tête (Titres)
  const headers = fields.map((f) => `"${(f.label || f.key).replace(/"/g, '""')}"`).join(';');

  // Lignes de contenu
  const rows = data.map((item) => {
    return fields
      .map((f) => {
        let val = '';
        if (typeof f.value === 'function') {
          val = f.value(item);
        } else if (f.key.includes('.')) {
          // Résolution de propriétés imbriquées (ex: formation.title)
          val = f.key.split('.').reduce((acc, part) => (acc ? acc[part] : ''), item);
        } else {
          val = item[f.key];
        }

        if (val === null || val === undefined) val = '';
        if (val instanceof Date) val = val.toISOString().split('T')[0];
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(';');
  });

  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.status(200).send(csvContent);
};
