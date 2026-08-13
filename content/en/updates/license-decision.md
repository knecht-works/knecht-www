---
title: Why Knecht is not open source
date: 2026-08-09
tag: Project
description: Knecht now has a license, the Functional Source License. This post explains what you can do with the code, why we did not select MIT, and how each version becomes open source after two years.
---

The [Knecht repo](https://github.com/knecht-works/knecht-cloud) was public on GitHub from the start, but it had no license. We changed that now. Knecht is under the Functional Source License, short FSL. This post explains why a license was necessary, why we did not select MIT, and what you can officially do with the code.

## Without a license, nothing is permitted

Public and free to use are two different things. Code has copyright protection, like a text or a photo. Without an explicit license, the default rule of copyright law applies. All rights are reserved. [GitHub states this itself](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository). You can only view a public repo without a license and fork it on the platform. You cannot download the code, change it, or use it in production.

A repo without a license is therefore more restrictive than the strictest license. That was not our intention. We simply did not decide the license question yet. Beta users who host Knecht themselves had our permission, but only in spoken form, not in writing.

## The dilemma

We had two requirements for the license, and at first sight they conflict. The code must stay public, and everyone must be able to host, read, and change Knecht for free. At the same time, Knecht must be able to make money one day, so the project can operate permanently. How exactly is open. Maybe a hosted version, maybe paid extra functions for teams.

A permissive license like [MIT](https://opensource.org/license/mit) or Apache does not fit these goals. Permissive means that everyone can do everything. A company could take Knecht and sell it as its own product. Elasticsearch showed where this leads. It had the Apache license, AWS sold it as its own managed service, and Elastic got nothing. In 2021 [Elastic moved to a more restrictive license](https://www.elastic.co/blog/licensing-change). AWS forked the last free version and now operates it as [OpenSearch](https://opensearch.org/). Terraform (fork: [OpenTofu](https://opentofu.org/)) and Redis (fork: [Valkey](https://valkey.io/)) went through the same cycle.

These stories share one point. The license change came late, after a community grew on the free license. A license change only applies to new versions. Code that was published under a permissive license stays permissive forever. And after the change, the community understandably supports the fork. If a limit is necessary, it must exist from the start.

## The candidates

We examined five licenses closely:

| License | Model | Forbids | Becomes open source |
| --- | --- | --- | --- |
| MIT / Apache | open source, permissive | nothing | it already is |
| AGPL | open source, copyleft | nothing, but you must publish your own changes | it already is |
| BSL | source available | what the vendor defines | after up to four years |
| ELv2 | source available | operation as a managed service | never |
| FSL | source available | competitive products | after two years |

The [AGPL](https://www.gnu.org/licenses/agpl-3.0.html) is the one true open source license that protects a business model. If you operate AGPL software as a web service or build it into a product, you must publish your own code. This blocks competitors reliably. But it also blocks the wrong people. Many companies ban AGPL software completely, because their legal team does not want to examine the publication duty in each case. Agencies with careful customers would be affected most, and Knecht is made exactly for these people.

BSL, ELv2, and FSL use the same model, and the model is called source available. The code is public and free to use, but only the vendor can sell it. The [BSL](https://mariadb.com/bsl11/) (from MariaDB) requires that the vendor writes the permitted use himself. Therefore each BSL text is different, and you must examine each one. Even the question if you can host the software for free depends on the vendor. The [ELv2](https://www.elastic.co/licensing/elastic-license) (from Elastic) is simple, but it never becomes open source. The FSL ([from Sentry](https://blog.sentry.io/introducing-the-functional-source-license-freedom-without-free-riding/)) is the newest of the three. It is one page of text, it has fixed rules, and it has a built-in conversion to open source.

## What the FSL permits

For most users the license changes nothing. It permits exactly what Knecht users do already:

- host Knecht yourself and use it in production, also commercially, also for customer projects
- read, change, and fork the code
- offer services around Knecht, for example setup and operation for a customer

The license forbids one thing. You cannot offer Knecht to others as your own commercial product. For example, you cannot sell Knecht as a hosted service or distribute Knecht under a different name. The [license text](https://fsl.software/) calls this Competing Use.

One clause made us select the FSL in the end. Two years after its release, each published version automatically gets the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0), which is true open source. This rule is irrevocable in the license text. We could not cancel it. If Knecht stops one day, the complete code becomes free after two years at the latest. Nobody here builds on software that someone can take away permanently.

## Not open source

People often call every public repo open source. But open source is a defined term. The [definition of the Open Source Initiative](https://opensource.org/osd) requires that a license does not exclude any field of use, and this includes competition. The FSL does exactly that with its ban on Competing Use. Therefore Knecht is not open source. The correct terms are source available or [Fair Source](https://fair.io/). Fair Source is the initiative in which Sentry and others collected this model.

## Next steps

One point is still on the list. Before we merge the first external pull request, we will set up a CLA, a [Contributor License Agreement](https://de.wikipedia.org/wiki/Contributor_License_Agreement). It is a short agreement. Contributors give us the right to license their contribution together with the rest of the code. Without it, the rights to the code would spread across many persons. Then we would have to negotiate each later license model with each single contributor.
