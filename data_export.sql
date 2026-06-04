--
-- PostgreSQL database dump
--

\restrict Uwo9VfKDajG9coqXUgCo3iEz0AdloPYMBmg5IEd75isVA2u9MF1kDUpkUBhWxBe

-- Dumped from database version 15.15
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Hotel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Hotel" (id, code, name, city, country, region, destination, address, email, phone, "tourOperatorId", "createdAt", "updatedAt") FROM stdin;
cmoj2izw600026dvipn9xhpxk	HP01	Hotel Paris	Paris	France	\N	\N	\N	\N	\N	default-operator	2026-04-28 20:18:09.078	2026-04-28 20:18:09.078
cmobxqdno00026da758zr27eh	HTL001	Hotel Tropicana	Antananarivo	Madagascar	\N	\N	\N	\N	\N	default-operator	2026-04-23 20:29:32.197	2026-05-29 19:28:28.08
\.


--
-- Data for Name: AgeCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AgeCategory" (id, name, "minAge", "maxAge", "hotelId") FROM stdin;
cmoj2l29c00046dvijc1f9g5o	Adulte	18	99	cmoj2izw600026dvipn9xhpxk
cmocv6ubx00056d2qib0bc4cf	Adulte	12	60	cmobxqdno00026da758zr27eh
\.


--
-- Data for Name: Currency; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Currency" (id, code, name, symbol) FROM stdin;
cmpbpf3fe00016d0mxoa9c73c	USD	US Dollar	$
cmpbpfa7e00026d0my25ygm2w	MGA	Ariary	Ar
cmpbpfhlo00036d0mcwhxtnsk	GBP	British Pound	£
cmpbpfs8o00046d0miez47456	MUR	Mauritian Rupee	₨
cmpbpki4c00066d0mbcysq82z	EUR	Euro	€
\.


--
-- Data for Name: Market; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Market" (id, code, name, "tourOperatorId", "createdAt", "updatedAt") FROM stdin;
cmp70mm1b00006dhbwqihgucw	FR	France	default-operator	2026-05-15 14:31:26.735	2026-05-15 14:31:26.735
cmp70mvxn00016dhbfmug820q	UK	United Kingdom	default-operator	2026-05-15 14:31:39.563	2026-05-15 14:31:39.563
cmp70n0sd00026dhbhhi7lx22	DE	Germany	default-operator	2026-05-15 14:31:45.853	2026-05-15 14:31:45.853
cmp70n5ys00036dhbluv3jtpn	IT	Italy	default-operator	2026-05-15 14:31:52.564	2026-05-15 14:31:52.564
cmp70neqa00046dhb0vfwaig3	ES	Spain	default-operator	2026-05-15 14:32:03.923	2026-05-15 14:32:03.923
cmp70o16s00066dhbcgxfn3jx	RE	Réunion	default-operator	2026-05-15 14:32:33.029	2026-05-15 14:32:33.029
cmp70o5qt00076dhb6yj9eusu	MU	Mauritius	default-operator	2026-05-15 14:32:38.933	2026-05-15 14:32:38.933
cmp70oa5u00086dhbwft2rgnp	ZA	South Africa	default-operator	2026-05-15 14:32:44.658	2026-05-15 14:32:44.658
cmp70oew100096dhbjl8yd9l2	CN	China	default-operator	2026-05-15 14:32:50.786	2026-05-15 14:32:50.786
cmp70olbh000a6dhb7c7noijr	JP	Japan	default-operator	2026-05-15 14:32:59.118	2026-05-15 14:32:59.118
cmp70ots9000b6dhbwzbpxce4	AU	Australia	default-operator	2026-05-15 14:33:10.089	2026-05-15 14:33:10.089
\.


--
-- Data for Name: MealPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MealPlan" (id, code, name, description, "tourOperatorId", "createdAt", "updatedAt") FROM stdin;
cmp3wxe2h00016dxt4b5cqfom	HB	Half Board	Petit-déjeuner et dîner inclus	default-operator	2026-05-13 10:24:32.621	2026-05-13 10:24:32.621
cmp3wxkoq00026dxtahz6d05w	FB	Full Board	Trois repas inclus	default-operator	2026-05-13 10:24:41.21	2026-05-13 10:24:41.21
cmp3wxyb100036dxt6n49rdfo	AI	All Inclusive	Tous repas et boissons inclus	default-operator	2026-05-13 10:24:58.861	2026-05-13 10:24:58.861
cmp3wy25200046dxtpleoaboo	RO	Room Only	\N	default-operator	2026-05-13 10:25:03.831	2026-05-13 10:25:03.831
cmp3wys8s00056dxtvvqe51cz	UAI	Ultra All Inclusive	All Inclusive premium avec activités	default-operator	2026-05-13 10:25:37.66	2026-05-13 10:25:37.66
cmp3wz4hj00066dxtvi69ygh6	SC	Self Catering	Cuisine équipée, repas non fournis	default-operator	2026-05-13 10:25:53.527	2026-05-13 10:25:53.527
cmp3wzpcw00076dxtg3pzdso8	DP	Demi-Pension	Petit-déjeuner et un repas au choix	default-operator	2026-05-13 10:26:20.576	2026-05-13 10:26:20.576
cmp3x017o00086dxtb4j27t2s	MP	Modified American Plan	Petit-déjeuner et dîner inclus version américaine	default-operator	2026-05-13 10:26:35.94	2026-05-13 10:26:35.94
cmp3x1p0v00096dxtm21wu6oc	AP	American Plan	Trois repas version américaine	default-operator	2026-05-13 10:27:53.455	2026-05-13 10:27:53.455
cmp3x1yja000a6dxt9dx1wp9i	EP	European Plan	Aucun repas inclus	default-operator	2026-05-13 10:28:05.783	2026-05-13 10:28:05.783
cmp3x2fkw000b6dxtn1fw7i1m	CP	Continental Plan	Petit-déjeuner continental inclus	default-operator	2026-05-13 10:28:27.872	2026-05-13 10:28:27.872
cmp3xxs2e000c6dxtwc0xyzhf	BB	Bed & Breakfast	Petit-déjeuner inclus	default-operator	2026-05-13 10:52:50.39	2026-05-13 10:52:50.39
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, "passwordHash", "firstName", "lastName", role, "tourOperatorId", "createdAt", "updatedAt") FROM stdin;
cmn64e5wm00006dxxozxjqo5q	admin@runner.com	$2b$10$h.pBDnMNpjx5h7LLVY2bd.0fl2woWndmh/oDeVsUkMaIHBx46L6xi	Admin	Runner	ADMIN	default-operator	2026-03-25 14:09:40.198	2026-03-25 14:09:40.198
cmn64e5wv00016dxxo5f4oe5e	manager@runner.com	$2b$10$h.pBDnMNpjx5h7LLVY2bd.0fl2woWndmh/oDeVsUkMaIHBx46L6xi	Marie	Manager	MANAGER	default-operator	2026-03-25 14:09:40.207	2026-03-25 14:09:40.207
cmn64e5wy00026dxxkj3ga2ht	agent@runner.com	$2b$10$h.pBDnMNpjx5h7LLVY2bd.0fl2woWndmh/oDeVsUkMaIHBx46L6xi	Jean	Agent	AGENT	default-operator	2026-03-25 14:09:40.21	2026-03-25 14:09:40.21
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RefreshToken" (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: RoomType; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RoomType" (id, name, code, "hotelId") FROM stdin;
cmoddlqrw00056dnlc7v4g7gj	Chambre Triple	TPL	cmobxqdno00026da758zr27eh
cmoddkfii00036dnl3qy20lo0	Chambre Double	DBL	cmobxqdno00026da758zr27eh
cmoj2ms1l00066dvik0p36eqs	Double	DBL	cmoj2izw600026dvipn9xhpxk
\.


--
-- Data for Name: RoomTypeCapacity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RoomTypeCapacity" (id, "roomTypeId", "ageCategoryId", "maxPax") FROM stdin;
cmox5entg00036diga6pj1m4e	cmoddkfii00036dnl3qy20lo0	cmocv6ubx00056d2qib0bc4cf	5
cmp1au91q00016dhjucdpl9q8	cmoddlqrw00056dnlc7v4g7gj	cmocv6ubx00056d2qib0bc4cf	4
cmox6jqqk00056dz7j2tsgh1d	cmoj2ms1l00066dvik0p36eqs	cmoj2l29c00046dvijc1f9g5o	5
\.


--
-- Data for Name: Season; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Season" (id, name, "startDate", "endDate", "tourOperatorId", "createdAt", "updatedAt") FROM stdin;
cmoj2eu1m00006dvi1emjsffh	Été 2026	2026-06-01 00:00:00	2026-08-31 00:00:00	default-operator	2026-04-28 20:14:54.874	2026-04-28 20:14:54.874
\.


--
-- Data for Name: Supplement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Supplement" (id, name, description, price, unit, "canReceiveDiscount", "tourOperatorId", "createdAt", "updatedAt") FROM stdin;
cmpfvgqht00016d5oudxpka3k	Lit bébé	\N	10.000000000000000000000000000000	PER_ROOM_PER_NIGHT	f	default-operator	2026-05-21 19:16:50.081	2026-05-21 19:16:50.081
cmpfvgyob00026d5omsrwvbku	Petit-déjeuner	\N	15.000000000000000000000000000000	PER_PERSON_PER_NIGHT	t	default-operator	2026-05-21 19:17:00.683	2026-05-21 19:17:00.683
cmpfvh6di00036d5ot5wwlvg1	Excursion ville	\N	45.000000000000000000000000000000	PER_PERSON_PER_STAY	t	default-operator	2026-05-21 19:17:10.662	2026-05-21 19:17:10.662
cmpfvhdqz00046d5ofot1xq5u	Parking	\N	8.000000000000000000000000000000	PER_ROOM_PER_NIGHT	f	default-operator	2026-05-21 19:17:20.219	2026-05-21 19:17:20.219
cmpfvgbcw00006d5o7qbpn4b7	Transfert aéroport...	\N	25.500000000000000000000000000000	PER_PERSON_PER_STAY	f	default-operator	2026-05-21 19:16:30.453	2026-05-21 19:21:10.374
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
ea6cbc8f-fad4-452c-a81c-1a25e25851f3	3bd24a70bb8d04d1f83c2a10a4559b241dc50ba8ce80a07ea91f41595839ed9b	2026-03-25 13:06:09.67403+00	20260325130609_init	\N	\N	2026-03-25 13:06:09.660394+00	1
c38b15cf-c773-429d-838b-b4a9be51439d	d2f0359bffb913e6172ddc164d1b9da49515a649c70f7c79c3edec3c615feca6	2026-04-18 20:11:57.373218+00	20260418201157_sprint2_hotels_seasons	\N	\N	2026-04-18 20:11:57.315984+00	1
4049c800-4382-4673-8a6d-04bc034089bc	7872f7d0e6b914e3020b417d394decd5965148858c49acd12bf73421f21f45aa	2026-04-25 19:42:55.569731+00	20260425194255_add_season_unique_name	\N	\N	2026-04-25 19:42:55.555984+00	1
cf2ccd63-8715-467a-8f4a-773b6d40cedc	ec7b9142143713a9af0257cd726d05c8b30043e1209af3b418223c6ecc70f71b	2026-05-08 13:15:34.754838+00	20260508131534_s2_be_007_room_type_capacity	\N	\N	2026-05-08 13:15:34.726635+00	1
2a1590bc-36c4-4c19-9b33-a9c34fc2bd4e	f9b3fb3c03db0366fa3ae55ba3aff771133690faf5803da5f490894be5f6dca4	2026-05-11 21:44:04.735803+00	20260511214404_add_meal_plan	\N	\N	2026-05-11 21:44:04.71602+00	1
2f9a7438-f25c-45bd-881b-d0fbda35fa75	33d80c2fa3e0ea60d170fe124b075529d55c3a1f49f507b868f6b0cb8b558a28	2026-05-14 20:20:28.885744+00	20260514202028_add_market	\N	\N	2026-05-14 20:20:28.856991+00	1
e9f87def-9fb4-4f9d-b2ad-6ef7403c5113	d908ab0f01ec97d6f3aa0cf5ab87ad7996328e0ba068f744224aba79762f1850	2026-05-15 20:02:35.369819+00	20260515200235_add_currency	\N	\N	2026-05-15 20:02:35.35507+00	1
4ab4f854-a56b-477a-a78b-4b84c3c71fb4	1e01de398bbb57f031732d253296bccdac8b419a7f7043c42a392e8e2b115e2b	2026-05-19 20:17:25.484705+00	20260519201725_add_supplement	\N	\N	2026-05-19 20:17:25.46807+00	1
\.


--
-- PostgreSQL database dump complete
--

\unrestrict Uwo9VfKDajG9coqXUgCo3iEz0AdloPYMBmg5IEd75isVA2u9MF1kDUpkUBhWxBe

