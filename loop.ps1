# Hermanos Override — Autonomous Engineering Loop
# External orchestration layer for Antigravity CLI

$MaxIterations = 30
$PrintTimeout = "15m"
$AutoApprove = $true

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogDirectory = Join-Path $ProjectRoot "logs"

New-Item -ItemType Directory -Force -Path $LogDirectory | Out-Null

function Write-LoopMessage {
    param (
        [string]$Message
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message"
}

function Get-AgyArguments {
    param (
        [bool]$ContinueSession
    )

    $arguments = @(
        "--print",
        "--print-timeout",
        $PrintTimeout,
        "--output-format",
        "text"
    )

    if ($ContinueSession) {
        $arguments += "--continue"
    }

    if ($AutoApprove) {
        $arguments += "--dangerously-skip-permissions"
    }

    return $arguments
}

function Invoke-Agy {
    param (
        [string]$Prompt,
        [bool]$ContinueSession
    )

    $arguments = Get-AgyArguments -ContinueSession $ContinueSession
    $arguments += $Prompt

    & agy @arguments 2>&1 | Out-String
}

$InitialPrompt = @"
You are operating as the autonomous engineering agent for this repository.

Read and follow:
- AGENTS.md
- LOOP.md
- PRD.md
- TASKS.md
- PROGRESS.md
- VERIFY.md
- DECISIONS.md

Begin the autonomous engineering loop from the current repository state.

Work continuously through TASKS.md without waiting for user confirmation
between tasks or phases.

For each task:
1. Inspect the current repository state.
2. Inspect and use relevant installed skills.
3. Delegate to specialized subagents when their independent expertise
   materially improves the task.
4. Implement the task.
5. Verify the acceptance criteria.
6. Fix verification failures before continuing.
7. Update TASKS.md and PROGRESS.md.
8. Record important architectural decisions in DECISIONS.md.
9. Create a concise one-line Conventional Commit for verified work.
10. Continue to the next unfinished task.

Do not stop merely because a phase has finished.

Do not ask the user whether you should continue.

Continue until:
- the complete MVP verification passes;
- a genuine blocker prevents autonomous progress; or
- the external loop invocation ends.

Treat the filesystem, Git history, tests, and project documentation as
persistent state.

At the end of this invocation, report what was accomplished and the current
project state, but do not wait for user confirmation before continuing.
"@

$ContinuationPrompt = @"
Continue the autonomous engineering loop.

Read the current persistent repository state, especially:
- TASKS.md
- PROGRESS.md
- VERIFY.md
- DECISIONS.md

Identify the next unfinished task whose dependencies are satisfied.

Continue implementing, verifying, fixing failures, updating project state,
and creating concise one-line Conventional Commits.

Use relevant installed skills and specialized subagents where appropriate.

Do not wait for user confirmation.

Do not stop merely because a phase has finished.

If the MVP is complete, perform or confirm the final verification gate and
report that the project is complete.

If genuinely blocked, document the blocker in PROGRESS.md and clearly report it.
"@

Write-Host ""
Write-Host "==============================================="
Write-Host " Hermanos Override Autonomous Engineering Loop"
Write-Host "==============================================="
Write-Host ""
Write-LoopMessage "Project: $ProjectRoot"
Write-LoopMessage "Maximum iterations: $MaxIterations"
Write-LoopMessage "Print timeout: $PrintTimeout"
Write-LoopMessage "Auto-approve: $AutoApprove"
Write-Host ""

Set-Location $ProjectRoot

for ($Iteration = 1; $Iteration -le $MaxIterations; $Iteration++) {

    Write-Host ""
    Write-Host "-----------------------------------------------"
    Write-LoopMessage "Iteration $Iteration / $MaxIterations"
    Write-Host "-----------------------------------------------"

    $continueSession = $Iteration -gt 1

    if ($continueSession) {
        Write-LoopMessage "Continuing existing Antigravity session..."
    }
    else {
        Write-LoopMessage "Starting Antigravity autonomous session..."
    }

    $startTime = Get-Date

    try {
        $output = Invoke-Agy `
            -Prompt $(if ($continueSession) { $ContinuationPrompt } else { $InitialPrompt }) `
            -ContinueSession $continueSession

        $duration = (Get-Date) - $startTime

        $logFile = Join-Path `
            $LogDirectory `
            ("iteration-{0:D3}-{1}.log" -f $Iteration, (Get-Date -Format "yyyyMMdd-HHmmss"))

        $output | Set-Content -Path $logFile -Encoding UTF8

        Write-Host ""
        Write-Host $output
        Write-Host ""

        Write-LoopMessage "Iteration completed in $([math]::Round($duration.TotalMinutes, 2)) minutes."
        Write-LoopMessage "Log saved to: $logFile"

        $lowerOutput = $output.ToLowerInvariant()

        # Obvious completion signals.
        $completionSignals = @(
            "mvp complete",
            "mvp is complete",
            "autonomous loop complete",
            "all mvp tasks",
            "final verification passed"
        )

        $blockedSignals = @(
            "genuine blocker",
            "cannot proceed",
            "unable to proceed",
            "blocked"
        )

        $completionDetected = $false
        foreach ($signal in $completionSignals) {
            if ($lowerOutput.Contains($signal)) {
                $completionDetected = $true
                break
            }
        }

        if ($completionDetected) {
            Write-Host ""
            Write-LoopMessage "Completion signal detected. Stopping autonomous loop."
            break
        }

        $blockedDetected = $false
        foreach ($signal in $blockedSignals) {
            if ($lowerOutput.Contains($signal)) {
                $blockedDetected = $true
                break
            }
        }

        if ($blockedDetected) {
            Write-Host ""
            Write-LoopMessage "Potential blocker detected. Stopping for inspection."
            break
        }

        if ($Iteration -lt $MaxIterations) {
            Write-LoopMessage "Continuing to next autonomous iteration..."
        }
    }
    catch {
        Write-Host ""
        Write-LoopMessage "Antigravity invocation failed."
        Write-LoopMessage $_.Exception.Message
        Write-LoopMessage "Stopping loop to prevent uncontrolled repeated failures."
        break
    }
}

Write-Host ""
Write-Host "==============================================="
Write-LoopMessage "Autonomous loop stopped."
Write-Host "==============================================="
Write-Host ""