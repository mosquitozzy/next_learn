'use server';
import { z } from 'zod';
import { revalidatePath } from "next/cache";
import postgres from "postgres";
import { redirect } from 'next/navigation';


export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
}


const sql = postgres(process.env.POSTGRES_URL!, {ssl: 'require'});

const FormSchema = z.object({
    customerId: z.string({
        invalid_type_error: 'Please Select a Customer'
    }),
    amount: z.coerce.number().gt(0, {message: 'Please enter a valid amount'}),
    status: z.enum(['paid', 'pending'], {
        invalid_type_error: 'Please Select a Status'
    }),
    date: z.string(),
    id: z.string()
});

const CreateInvoice = FormSchema.omit({ id: true , date: true})

const UpdateInvoice = FormSchema.omit({ id: true, date: true})


export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse(
        {
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status')
        }
    );

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    const newDate = new Date().toISOString().split('T')[0];
    try {
        await sql ` INSERT INTO invoices (customer_id, amount, status, date) VALUES (${customerId}, ${amountInCents}, ${status}, ${newDate})`
    } catch (error) {
        console.error(error);
    }
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices')
}

export async function updateInvoice(id: string,prevState: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse(
        {
            customerId: formData.get('customerId'),
            amount: formData.get('amount'),
            status: formData.get('status')
        }
    );
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }
    const { customerId, amount, status } = validatedFields.data;
    const amountInCents = amount * 100;
    try {
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}
        `;
    } catch (error) {
        console.error(error);
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices')
}

export async function deleteInvoice(id: string) {
    try {
        await sql`
            DELETE FROM invoices
            WHERE id = ${id}
        `;
    } catch (error) {
        console.error(error);
    }

    revalidatePath('/dashboard/invoices');
}