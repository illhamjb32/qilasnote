import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  let query = supabase.from('milk_records').select('*')

  if (date) {
    query = query.eq('date', date)
  } else if (startDate) {
    query = query.gte('date', startDate)
    if (endDate) {
      query = query.lte('date', endDate)
    }
  }

  const { data, error } = await query.order('timestamp', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { amount, time, date, timestamp } = body

  const { data, error } = await supabase
    .from('milk_records')
    .insert([{ amount, time, date, timestamp }])
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('milk_records')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
