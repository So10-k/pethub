import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let body: any = {}
    if (contentType.includes('application/json')) {
      body = await req.json()
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData()
      body = Object.fromEntries(form.entries())
    }
    // For now, just log to server output. You can persist to Prisma later.
    console.log('[CTA]', {
      label: body?.label,
      href: body?.href,
      ts: Number(body?.ts) || Date.now(),
      ua: req.headers.get('user-agent') || '',
    })
    return new NextResponse(null, { status: 204 })
  } catch (e) {
    return NextResponse.json({ ok: true }, { status: 204 })
  }
}
