import { NextResponse } from 'next/server';
import { getSeatsByShow } from '@/services/seatService';
import { ApiResponse } from '@/types/api';
import { Seat } from '@/types/seats';

export async function GET(
  request: Request,
  { params }: { params: { showId: string } }
) {
  try {
    const { showId } = params;

    if (!showId) {
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          code: 'INVALID_SHOW_ID',
          details: 'El parametro showId es requerido.',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const seats: Seat[] = await getSeatsByShow(showId);

    const response: ApiResponse<Seat[]> = {
      success: true,
      data: seats,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('❌ Error en GET /api/shows/[showId]/seats:', error);

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        details: 'Ocurrio un error al obtener la disponibilidad de asientos.',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}