"use client";

import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { AnswerOption } from "@/components/quiz/AnswerOption";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import type { TourQuestionView } from "@/lib/audit/server";
import { tourScore } from "@/lib/audit/quadrants";
import type { Pass } from "@/lib/audit/schema";
import type { AnswerIndex } from "@/lib/scoring/compute";
import { AUDIT_PILLAR_LABELS } from "./labels";
import styles from "./page.module.css";

/**
 * Le Tour de l'auditeur — les 15 questions du questionnaire public, remplies
 * ici par MOI et jamais envoyées à l'équipe en auto-évaluation.
 *
 * C'est la distinction que l'avertissement en tête rappelle, et elle n'est
 * pas rhétorique : le déclaratif d'une équipe sur ses propres pratiques est
 * un objet différent du constat d'un tiers, et les mélanger ferait entrer
 * dans le diagnostic une donnée qu'on ne pourrait pas défendre.
 *
 * **Les 15 questions sur un seul écran**, contrairement à `/quiz` qui en
 * montre une à la fois. Ce n'est pas un parcours de trois minutes : c'est un
 * formulaire qu'on remplit par morceaux, entre deux entretiens, en sautant
 * directement à ce qu'on vient d'apprendre. Une question à la fois
 * obligerait à traverser quatorze écrans pour corriger la quinzième.
 *
 * **Les points sont affichés**, là où `AnswerOption` dit explicitement
 * « never label an option with its score — scoring stays invisible to the
 * user ». Cette règle vaut pour le questionnaire public, où voir les points
 * fausserait les réponses. Ici, c'est l'auditeur qui note : lui cacher le
 * barème reviendrait à lui demander de noter à l'aveugle.
 *
 * **Le score n'apparaît qu'à 15/15** (`tourScore` rend `null` avant), et
 * toujours avec son détail par pilier : un score sur 100 sans son détail est
 * exactement ce que le catalogue interdit d'en faire (`m19`, piège). Le
 * choix `showTourScore` de la mission ne concerne QUE le livrable direction,
 * jamais cet écran — c'est mon outil de travail.
 */
export function TourScreen({
  questions,
  pass,
  onAnswer,
  onClose,
}: {
  questions: readonly TourQuestionView[];
  pass: Pass;
  onAnswer: (questionId: string, index: AnswerIndex) => void;
  onClose: () => void;
}) {
  const answered = questions.filter((q) => pass.tourAnswers[q.id] !== undefined).length;
  const score = tourScore(pass, questions);

  return (
    <section className={styles.screen}>
      <div className={styles.screenHead}>
        <h2 className={styles.h2}>Le Tour</h2>
        <Button compact variant="secondary" onClick={onClose} data-testid="close-tour">
          Retour
        </Button>
      </div>

      <Card elevation="panel" className={styles.placeholder}>
        <p className={styles.muted} data-testid="tour-warning">
          Tes réponses d&apos;auditeur, d&apos;après ce que les entretiens ont appris — jamais une auto-évaluation envoyée à
          l&apos;équipe. Remplis au fil de l&apos;eau : rien n&apos;oblige à finir d&apos;un coup.
        </p>
      </Card>

      <p className={styles.counters} data-testid="tour-progress">
        {answered} sur {questions.length} répondues
      </p>

      {score ? (
        <Card elevation="panel" className={styles.tourScore} data-testid="tour-score">
          <MetaLabel size="xs" wide>
            Score de pratiques
          </MetaLabel>
          <p className={styles.tourTotal}>{score.total} / 100</p>
          <ul className={styles.tourPillars}>
            {score.pillars.map((pillar) => (
              <li key={pillar.pillar} data-testid={`tour-pillar-${pillar.pillar}`}>
                <span>{AUDIT_PILLAR_LABELS[pillar.pillar]}</span>
                <span>
                  {pillar.rawPoints} / 60 → {pillar.score} / 20
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.muted}>
            Des pratiques déclarées, pas une performance. Il ne se moyenne jamais avec les compteurs de couverture : ce sont deux axes.
          </p>
        </Card>
      ) : (
        <p className={styles.muted} data-testid="tour-score-pending">
          Le score apparaîtra une fois les {questions.length} réponses posées — un score partiel dirait un chiffre qui bougera encore.
        </p>
      )}

      <ul className={styles.tourList} data-testid="tour-questions">
        {questions.map((question, index) => {
          const chosen = pass.tourAnswers[question.id];
          return (
            <li key={question.id} className={styles.tourQuestion} data-testid={`tour-question-${question.id}`}>
              <MetaLabel size="xs" wide>
                {index + 1} / {questions.length} · {AUDIT_PILLAR_LABELS[question.pillar]}
              </MetaLabel>
              <QuestionCard size="mobile">{question.question}</QuestionCard>
              <div className={styles.tourOptions}>
                {question.options.map((option, optionIndex) => (
                  <AnswerOption
                    key={option.label}
                    size="mobile"
                    selected={chosen === optionIndex}
                    onClick={() => onAnswer(question.id, optionIndex as AnswerIndex)}
                    data-testid={`tour-answer-${question.id}-${optionIndex}`}
                  >
                    {option.label}
                    <span className={styles.tourPoints}> — {option.points} pts</span>
                  </AnswerOption>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
