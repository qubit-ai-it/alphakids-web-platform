# Word Management Specification

## Purpose

Teachers record audio pronunciation for vocabulary words via browser microphone in the word creation/editing form. Audio is captured using the MediaRecorder API and submitted alongside word data.

## Requirements

### R1: Browser Microphone Recording

The system MUST provide a "Grabar audio" button in the WordForm that uses `navigator.mediaDevices.getUserMedia` + MediaRecorder to capture audio. The existing file upload MUST remain available as an alternative.

#### Scenario: Record audio flow

- GIVEN the WordForm is open for creating or editing a word
- WHEN the user clicks "Grabar audio"
- THEN the browser requests microphone permission
- AND recording begins with a pulsing red indicator and elapsed time counter

#### Scenario: Stop and preview

- GIVEN recording is active
- WHEN the user clicks "Detener"
- THEN recording stops
- AND the recorded audio plays back in a preview player

#### Scenario: Re-record

- GIVEN a recording preview is shown
- WHEN the user clicks "Volver a grabar"
- THEN the previous recording is discarded
- AND a new recording session begins

### R2: Submit Audio as File

The recorded audio MUST be submitted as a `File` named `grabacion.webm` through the existing `onSubmit` interface (`audioFile?: File`).

#### Scenario: Submit recorded audio

- GIVEN a recording has been accepted
- WHEN the user submits the form
- THEN the audio is sent as `audioFile: File` with name `grabacion.webm` and MIME type `audio/webm`

#### Scenario: File upload still works

- GIVEN the WordForm is open
- WHEN the user selects an audio file from disk instead of recording
- THEN the file is submitted as before via `audioFile`

### R3: Feature Detection

The system MUST check that `navigator.mediaDevices?.getUserMedia` is available before showing the "Grabar audio" button. If unavailable, the button MUST be hidden.

#### Scenario: Unsupported browser

- GIVEN a browser without MediaRecorder or getUserMedia support
- WHEN the WordForm renders
- THEN the "Grabar audio" button is not displayed
- AND the file upload input remains fully functional
