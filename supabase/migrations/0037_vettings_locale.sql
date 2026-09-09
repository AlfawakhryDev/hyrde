-- 0037 — the language an interview is conducted in
--
-- Carried on the row rather than re-sent per request: the grader runs at the
-- end of the last answer, and a candidate who switched the site language
-- halfway through would otherwise be graded in a language they did not answer
-- in. An interview is one conversation and stays in one language.
alter table public.vettings add column if not exists locale text not null default 'en';

comment on column public.vettings.locale is
  'Language of this interview, set at start. The interviewer and the grader both read it.';
