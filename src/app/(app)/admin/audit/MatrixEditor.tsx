"use client";

import { Button } from "@/components/core/Button";
import type { Matrix } from "@/lib/audit/schema";
import { Field } from "./_ui/Field";
import { NumberInput } from "./_ui/NumberInput";
import { TextInput } from "./_ui/TextInput";
import styles from "./page.module.css";

/**
 * L'éditeur de matrice — et, réduit à une ligne, l'éditeur des couples, des
 * distributions et des composites (AUDIT-PLAN.md §3.3, décision 5).
 *
 * Un couple (« NRR et GRR »), une distribution (« médian et dispersion ») et
 * un composite (« mouvement de MRR décomposé ») sont la même chose : des
 * valeurs nommées qui vont ensemble et qu'on ne lit jamais séparément. Leur
 * donner trois éditeurs aurait été trois fois le même code et trois endroits
 * où la forme stockée peut diverger. `ObservationValue` accepte déjà
 * `Matrix`, donc rien à changer au schéma.
 *
 * **Le N est sur la ligne, pas sur la matrice** : une cohorte de 412 clients
 * et une de 12 ne se lisent pas pareil, et c'est la première question posée
 * devant un tableau de rétention.
 *
 * Ajouter ou retirer une colonne touche TOUTES les lignes — une matrice dont
 * une ligne a une cellule de moins que les colonnes est illisible, et rien
 * dans le type ne l'empêche.
 */
export function MatrixEditor({
  id,
  value,
  singleRow,
  columnPlaceholder,
  onChange,
}: {
  id: string;
  value: Matrix;
  /** Couple / distribution / composite : une seule ligne, sans libellé de ligne. */
  singleRow?: boolean;
  /** Un exemple de nom de colonne, qui n'est pas le même selon la forme (« NRR » contre « J30 »). */
  columnPlaceholder?: string;
  onChange: (value: Matrix) => void;
}) {
  function setColumn(index: number, label: string) {
    onChange({ ...value, columns: value.columns.map((c, i) => (i === index ? label : c)) });
  }

  function addColumn() {
    onChange({
      columns: [...value.columns, ""],
      rows: value.rows.map((row) => ({ ...row, cells: [...row.cells, null] })),
    });
  }

  function removeColumn(index: number) {
    onChange({
      columns: value.columns.filter((_, i) => i !== index),
      rows: value.rows.map((row) => ({ ...row, cells: row.cells.filter((_, i) => i !== index) })),
    });
  }

  function patchRow(index: number, next: Partial<Matrix["rows"][number]>) {
    onChange({ ...value, rows: value.rows.map((row, i) => (i === index ? { ...row, ...next } : row)) });
  }

  function setCell(rowIndex: number, cellIndex: number, cell: number | null) {
    patchRow(rowIndex, { cells: value.rows[rowIndex]!.cells.map((c, i) => (i === cellIndex ? cell : c)) });
  }

  return (
    <div className={styles.matrix} data-testid={`matrix-${id}`}>
      <div className={styles.matrixColumns}>
        {value.columns.map((column, index) => (
          <div key={index} className={styles.matrixColumn}>
            <Field label={`Colonne ${index + 1}`} htmlFor={`${id}-col-${index}`}>
              <TextInput id={`${id}-col-${index}`} value={column} onChange={(label) => setColumn(index, label)} placeholder={columnPlaceholder} />
            </Field>
            {value.columns.length > 1 ? (
              <Button compact variant="secondary" onClick={() => removeColumn(index)} data-testid={`remove-column-${index}`}>
                Retirer
              </Button>
            ) : null}
          </div>
        ))}
        <Button compact variant="secondary" onClick={addColumn} data-testid={`add-column-${id}`}>
          Ajouter une colonne
        </Button>
      </div>

      {value.rows.map((row, rowIndex) => (
        <div key={rowIndex} className={styles.matrixRowBlock}>
          {singleRow ? null : (
            <Field label="Ligne" htmlFor={`${id}-row-${rowIndex}`}>
              <TextInput
                id={`${id}-row-${rowIndex}`}
                value={row.label}
                onChange={(label) => patchRow(rowIndex, { label })}
                placeholder="Cohorte de janvier"
              />
            </Field>
          )}
          {/*
            Le N est sur sa propre ligne, PAS dans la grille des cellules. Il
            décrit la ligne, il n'en est pas une valeur — et sa phrase d'aide
            le rend deux fois plus haut qu'une cellule, ce qui décalait les
            cellules suivantes d'une rangée : un couple ne se lisait plus
            côte à côte, ce qui est précisément ce que « toujours en couple »
            demande. Vu en capture, pas à la relecture.
          */}
          <Field label="Population (N)" htmlFor={`${id}-n-${rowIndex}`} hint="Combien de clients, de comptes ou d'utilisateurs derrière ces chiffres.">
            <NumberInput id={`${id}-n-${rowIndex}`} value={row.n} onChange={(n) => patchRow(rowIndex, { n: n ?? 0 })} />
          </Field>
          <div className={styles.matrixCells}>
            {row.cells.map((cell, cellIndex) => (
              <Field
                key={cellIndex}
                label={value.columns[cellIndex]?.trim() || `Colonne ${cellIndex + 1}`}
                htmlFor={`${id}-cell-${rowIndex}-${cellIndex}`}
              >
                <NumberInput id={`${id}-cell-${rowIndex}-${cellIndex}`} value={cell} onChange={(next) => setCell(rowIndex, cellIndex, next)} />
              </Field>
            ))}
          </div>
          {!singleRow && value.rows.length > 1 ? (
            <Button
              compact
              variant="secondary"
              onClick={() => onChange({ ...value, rows: value.rows.filter((_, i) => i !== rowIndex) })}
              data-testid={`remove-row-${rowIndex}`}
            >
              Retirer la ligne
            </Button>
          ) : null}
        </div>
      ))}

      {singleRow ? null : (
        <Button
          compact
          variant="secondary"
          onClick={() => onChange({ ...value, rows: [...value.rows, { label: "", n: 0, cells: value.columns.map(() => null) }] })}
          data-testid={`add-row-${id}`}
        >
          Ajouter une ligne
        </Button>
      )}
    </div>
  );
}

/** Une matrice neuve, à la forme que l'éditeur attend — jamais des colonnes sans cellules. */
export function blankMatrix(columns: number, rows: number): Matrix {
  return {
    columns: Array.from({ length: columns }, () => ""),
    rows: Array.from({ length: rows }, () => ({ label: "", n: 0, cells: Array.from({ length: columns }, () => null) })),
  };
}
