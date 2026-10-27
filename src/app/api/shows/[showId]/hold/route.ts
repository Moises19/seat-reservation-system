import { NextResponse } from 'next/server';
import { createSeatHold } from '@/services/reservationService';
import { ApiResponse, CreateHoldRequest, CreateHoldResponse } from '@/types/api';

export async function POST(
  request: Request,
  { params }: { params: { showId: string } }
) {
  try {
    const { showId } = params;
    const body: CreateHoldRequest = await request.json();

    const { seatIds, sessionId } = body;

    // Validaciones de entrada
    if (!showId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0 || !sessionId) {
      const errorResponse: ApiResponse = {
        success: false,
        error: {
          code: 'INVALID_REQUEST_PAYLOAD',
          details: 'Debes proporcionar showId, sessionId y al menos un seatId.',
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Intentar crear el bloqueo atómico en BBDD
    const holdResult: CreateHoldResponse = await createSeatHold(
      showId,
      seatIds,
      sessionId
    );

    const response: ApiResponse<CreateHoldResponse> = {
      success: true,
      message: 'Asientos reservados temporalmente por 10 minutos.',
      data: holdResult,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error en POST /api/shows/[showId]/hold:', error);

    // Manejo de errores de negocio (conflictos de concurrencia)
    if (error.message === 'SEATS_ALREADY_RESERVED') {
      const conflictResponse: ApiResponse = {
        success: false,
        error: {
          code: 'SEATS_ALREADY_RESERVED',
          details: 'Uno o mas asientos seleccionados ya han sido reservados por otro usuario.',
        },
      };
      return NextResponse.json(conflictResponse, { status: 409 }); // 409 Conflict
    }

    if (error.message === 'SEATS_NOT_FOUND_OR_BLOCKED') {
      const notFoundResponse: ApiResponse = {
        success: false,
        error: {
          code: 'SEATS_NOT_FOUND',
          details: 'Uno o mas asientos no existen o se encuentran deshabilitados.',
        },
      };
      return NextResponse.json(notFoundResponse, { status: 404 });
    }

    const errorResponse: ApiResponse = {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        details: 'No se pudo completar la reserva temporal del asiento.',
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}