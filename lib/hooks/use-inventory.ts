// Update the startAudit function in useInventory hook
const startAudit = async (params: { customerId?: string; notes?: string }): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('audits')
      .insert([{
        customer_id: params.customerId,
        status: 'in_progress',
        date: new Date().toISOString(),
        performed_by: user.id,
        notes: params.notes,
        items_count: 0,
        discrepancies_count: 0,
      }])
      .select()
      .single();

    if (error) throw error;

    toast({
      title: 'Success',
      description: 'Audit started successfully',
    });

    return data.id;
  } catch (err) {
    toast({
      title: 'Error',
      description: 'Failed to start audit',
      variant: 'destructive',
    });
    throw err;
  }
};