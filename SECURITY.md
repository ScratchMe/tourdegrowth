# Security policy

Tour de Growth is a one-person side project, live at
[www.tourdegrowth.com](https://www.tourdegrowth.com). Only what is deployed
there — the `main` branch of this repository — is supported. There is no
older version to patch.

## Reporting a vulnerability

Email **contact@tourdegrowth.com** with "Security" in the subject line.
Please do not open a public issue for anything that could be exploited.

A useful report says:

- what the problem is and where (URL, route or file);
- how to reproduce it, step by step;
- what an attacker could do with it.

You will get an acknowledgement within seven days, then a fix or an
explanation of why it is not treated as a vulnerability. There is no bug
bounty — but you will be credited in the fix's commit message if you want
to be.

## What is worth reporting

The site keeps very little, and the privacy policy
([EN](https://www.tourdegrowth.com/en/privacy) ·
[FR](https://www.tourdegrowth.com/fr/privacy)) lists all of it. The areas
that matter most:

- anything that exposes a stored result beyond what its shared link already
  shows — its answers, or anything that lets you act as its owner;
- anything that lets someone complete or overwrite a Deep dive on a result
  they did not create;
- a way into `/admin` without its password;
- a way to make the site send user data anywhere its privacy policy does
  not say.

## Testing in good faith

Research that respects the following is welcome and will not be treated as
an attack:

- only use results you created yourself;
- do not run automated scanners or load tests against the live site — the
  rate limits are there to protect a free-tier database and a paid model API,
  not to be measured;
- stop and report as soon as you can access data that is not yours.
