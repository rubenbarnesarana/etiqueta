import {
  supabase
} from "./Supabase";

import type {
  ProductTemplateAssignment
} from "./ProductTemplateStorage";


interface ProductTemplateAssignmentRow {

  sku: string;

  template_id: number;

  created_at?: string;

  updated_at?: string;

}


function rowToAssignment(
  row: ProductTemplateAssignmentRow
): ProductTemplateAssignment {

  return {

    sku:
      String(
        row.sku
      ).trim(),

    templateId:
      Number(
        row.template_id
      )

  };

}


function assignmentToRow(
  assignment: ProductTemplateAssignment
): ProductTemplateAssignmentRow {

  return {

    sku:
      String(
        assignment.sku
      ).trim(),

    template_id:
      Number(
        assignment.templateId
      )

  };

}


export async function getSupabaseAssignments():
  Promise<ProductTemplateAssignment[]> {

  const {
    data,
    error
  } =
    await supabase
      .from(
        "product_template_assignments"
      )
      .select(
        "*"
      )
      .order(
        "sku",
        {
          ascending: true
        }
      );


  if (
    error
  ) {

    throw error;

  }


  return (
    data ?? []
  ).map(
    row =>
      rowToAssignment(
        row as ProductTemplateAssignmentRow
      )
  );

}


export async function saveSupabaseAssignment(
  assignment: ProductTemplateAssignment
): Promise<void> {

  const row =
    assignmentToRow(
      assignment
    );


  const {
    error
  } =
    await supabase
      .from(
        "product_template_assignments"
      )
      .upsert(
        row,
        {
          onConflict:
            "sku"
        }
      );


  if (
    error
  ) {

    throw error;

  }

}


export async function saveSupabaseAssignments(
  assignments: ProductTemplateAssignment[]
): Promise<void> {

  if (
    assignments.length ===
    0
  ) {

    return;

  }


  const BATCH_SIZE =
    500;


  for (
    let index = 0;
    index < assignments.length;
    index += BATCH_SIZE
  ) {

    const batch =
      assignments
        .slice(
          index,
          index + BATCH_SIZE
        )
        .map(
          assignment =>
            assignmentToRow(
              assignment
            )
        );


    const {
      error
    } =
      await supabase
        .from(
          "product_template_assignments"
        )
        .upsert(
          batch,
          {
            onConflict:
              "sku"
          }
        );


    if (
      error
    ) {

      throw error;

    }

  }

}


export async function deleteSupabaseAssignment(
  sku: string
): Promise<void> {

  const cleanSku =
    String(
      sku
    ).trim();


  const {
    error
  } =
    await supabase
      .from(
        "product_template_assignments"
      )
      .delete()
      .eq(
        "sku",
        cleanSku
      );


  if (
    error
  ) {

    throw error;

  }

}