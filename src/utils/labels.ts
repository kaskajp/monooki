import getDatabase from '../database/connection';

export interface LabelConfig {
  format: string;
  padding: number;
  separator: string;
  nextNumber: number;
}

export const generateLabelId = (config: LabelConfig): string => {
  const { format, padding, separator, nextNumber } = config;
  
  // Ensure nextNumber is valid, default to 1 if null/undefined
  const safeNextNumber = nextNumber || 1;
  const safePadding = padding || 1;
  const safeSeparator = separator || '';
  const safeFormat = format || '{number}';
  
  // Pad the number with zeros
  const paddedNumber = safeNextNumber.toString().padStart(safePadding, '0');
  
  // Replace placeholders in format
  let labelId = safeFormat
    .replace('{number}', paddedNumber)
    .replace('{separator}', safeSeparator);
  
  return labelId;
};

export const getWorkspaceLabelConfig = async (workspaceId: string): Promise<LabelConfig> => {
  const db = getDatabase();
  
  const workspace = await db.get(`
    SELECT label_format, label_padding, label_separator, label_next_number
    FROM workspaces 
    WHERE id = ?
  `, [workspaceId]);
  
  if (!workspace) {
    throw new Error('Workspace not found');
  }
  
  return {
    format: workspace.label_format || '{number}',
    padding: workspace.label_padding || 1,
    separator: workspace.label_separator || '',
    nextNumber: workspace.label_next_number || 1
  };
};

export const generateAndAssignLabelId = async (workspaceId: string): Promise<string> => {
  const db = getDatabase();
  
  // Get current label configuration
  const config = await getWorkspaceLabelConfig(workspaceId);
  
  // Generate the label ID
  const labelId = generateLabelId(config);
  
  // Increment the next number for the workspace
  await db.run(`
    UPDATE workspaces 
    SET label_next_number = label_next_number + 1 
    WHERE id = ?
  `, [workspaceId]);
  
  return labelId;
};

export const updateWorkspaceLabelConfig = async (
  workspaceId: string, 
  config: Partial<LabelConfig>
): Promise<void> => {
  const db = getDatabase();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (config.format !== undefined) {
    updates.push('label_format = ?');
    values.push(config.format);
  }
  
  if (config.padding !== undefined) {
    updates.push('label_padding = ?');
    values.push(config.padding);
  }
  
  if (config.separator !== undefined) {
    updates.push('label_separator = ?');
    values.push(config.separator);
  }
  
  if (config.nextNumber !== undefined) {
    updates.push('label_next_number = ?');
    values.push(config.nextNumber);
  }
  
  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(workspaceId);
    
    await db.run(`
      UPDATE workspaces 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `, values);
  }
};

export const previewLabelFormat = (format: string, padding: number, separator: string, number: number = 1): string => {
  const config: LabelConfig = {
    format: format || '{number}',
    padding: padding || 1,
    separator: separator || '',
    nextNumber: number || 1
  };
  
  return generateLabelId(config);
}; 