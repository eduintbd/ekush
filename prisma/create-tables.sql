-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'INVESTOR',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "investorCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "investorType" TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    "nidNumber" TEXT,
    "tinNumber" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "address" TEXT,
    "riskProfile" TEXT,
    "boId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "investors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funds" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fundType" TEXT,
    "description" TEXT,
    "objective" TEXT,
    "inceptionDate" TIMESTAMP(3),
    "currentNav" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "previousNav" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAum" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "faceValue" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "managementFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trusteeFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custodianFeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "entryLoad" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exitLoad" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minInvestment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minSipAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_holdings" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "lsUnitsBought" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lsUnitsSold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lsCurrentUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lsCostValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lsCostOfUnitsSold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lsCostValueCurrent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lsRealizedGain" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lsWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lsAvgCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lsMarketValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sipUnitsBought" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sipUnitsSold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sipCurrentUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sipCostValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sipCostOfUnitsSold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sipCostValueCurrent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sipRealizedGain" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sipWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sipAvgCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sipMarketValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalUnitsBought" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalUnitsSold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "boOpeningBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCurrentUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCostValueCurrent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nav" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMarketValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSellableUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marketValueSellable" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRealizedGain" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalUnrealizedGain" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentUnitsHold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossDividend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fund_holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nav" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "units" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cumulativeUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitCapital" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitPremium" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgCostAtTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "realizedGain" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costOfUnitsSold" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "uniqueCode" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EXECUTED',
    "paymentMethod" TEXT,
    "paymentRef" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nav_records" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "nav" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "nav_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dividends" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "accountingYear" TEXT,
    "paymentDate" TIMESTAMP(3),
    "totalUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dividendPerUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossDividend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netDividend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dividendOption" TEXT NOT NULL DEFAULT 'CASH',
    "tinNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dividends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_certificates" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "beginningUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "beginningCostValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "beginningMarketValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "beginningUnrealizedGain" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "endingUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "endingCostValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "endingMarketValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "endingUnrealizedGain" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalUnitsAdded" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAdditionAtCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalUnitsRedeemed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRedemptionAtCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netInvestment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalRealizedGain" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalGrossDividend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalNetDividend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "navAtEnd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tax_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_statements" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "data" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_expenses" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "managementFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trusteeFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "custodianFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "auditFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bsecFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cdblCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "brokerageComm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bankCharges" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fund_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_records" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "documentUrl" TEXT,
    "selfieUrl" TEXT,
    "matchScore" DOUBLE PRECISION,
    "verifiedBy" TEXT,
    "rejectionReason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "branchName" TEXT,
    "accountNumber" TEXT NOT NULL,
    "routingNumber" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nominees" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT,
    "nidNumber" TEXT,
    "share" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nominees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consents" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "ipAddress" TEXT,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sip_plans" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "bankAccountId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
    "debitDay" INTEGER NOT NULL DEFAULT 10,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sip_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "description" TEXT,
    "trackingNumber" TEXT NOT NULL,
    "slaDeadline" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_comments" (
    "id" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_queue" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "makerId" TEXT NOT NULL,
    "checkerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "approval_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "investorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_commentaries" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_commentaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "investors_userId_key" ON "investors"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "investors_investorCode_key" ON "investors"("investorCode");

-- CreateIndex
CREATE UNIQUE INDEX "funds_code_key" ON "funds"("code");

-- CreateIndex
CREATE UNIQUE INDEX "fund_holdings_investorId_fundId_key" ON "fund_holdings"("investorId", "fundId");

-- CreateIndex
CREATE INDEX "transactions_investorId_fundId_idx" ON "transactions"("investorId", "fundId");

-- CreateIndex
CREATE INDEX "transactions_orderDate_idx" ON "transactions"("orderDate");

-- CreateIndex
CREATE UNIQUE INDEX "nav_records_fundId_date_key" ON "nav_records"("fundId", "date");

-- CreateIndex
CREATE INDEX "dividends_investorId_fundId_idx" ON "dividends"("investorId", "fundId");

-- CreateIndex
CREATE INDEX "tax_certificates_investorId_fundId_idx" ON "tax_certificates"("investorId", "fundId");

-- CreateIndex
CREATE UNIQUE INDEX "service_requests_trackingNumber_key" ON "service_requests"("trackingNumber");

-- CreateIndex
CREATE INDEX "notifications_userId_isRead_idx" ON "notifications"("userId", "isRead");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "market_commentaries_slug_key" ON "market_commentaries"("slug");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "investors" ADD CONSTRAINT "investors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_holdings" ADD CONSTRAINT "fund_holdings_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_holdings" ADD CONSTRAINT "fund_holdings_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nav_records" ADD CONSTRAINT "nav_records_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dividends" ADD CONSTRAINT "dividends_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dividends" ADD CONSTRAINT "dividends_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_certificates" ADD CONSTRAINT "tax_certificates_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_certificates" ADD CONSTRAINT "tax_certificates_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_statements" ADD CONSTRAINT "financial_statements_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_expenses" ADD CONSTRAINT "fund_expenses_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_records" ADD CONSTRAINT "kyc_records_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nominees" ADD CONSTRAINT "nominees_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consents" ADD CONSTRAINT "consents_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sip_plans" ADD CONSTRAINT "sip_plans_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sip_plans" ADD CONSTRAINT "sip_plans_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "funds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sip_plans" ADD CONSTRAINT "sip_plans_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_investorId_fkey" FOREIGN KEY ("investorId") REFERENCES "investors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

